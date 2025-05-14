'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, ArrowUpRight, ArrowDownRight, DollarSign, Menu, X, LayoutDashboard, Receipt } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Navbar from '@/components/Navbar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Transaction {
  _id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  sender: string;
  receiver: string;
  date: string;
  note?: string;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [overLimit, setOverLimit] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const limitFormRef = useRef<HTMLFormElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchTransactions();
    fetchSummaryAndLimit();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryAndLimit = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const res = await fetch('/api/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      setMonthlyLimit(data.monthlyLimit);
      setOverLimit(data.overLimit);
      if (data.monthlyLimit) setLimitInput(data.monthlyLimit.toString());
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const res = await fetch('/api/limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyLimit: Number(limitInput) }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to set limit');
      }
      await fetchSummaryAndLimit();
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getChartData = () => {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    const expenses = transactions.filter(t => t.type === 'expense');

    switch (timePeriod) {
      case 'daily':
        // Last 7 days
        labels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        data = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          return expenses
            .filter(t => new Date(t.date).toDateString() === date.toDateString())
            .reduce((sum, t) => sum + t.amount, 0);
        });
        break;

      case 'weekly':
        // Last 4 weeks
        labels = Array.from({ length: 4 }, (_, i) => `Week ${4 - i}`);
        data = Array.from({ length: 4 }, (_, i) => {
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - (28 - i * 7));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          return expenses
            .filter(t => {
              const date = new Date(t.date);
              return date >= startDate && date <= endDate;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        });
        break;

      case 'monthly':
        // Last 6 months
        labels = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (5 - i));
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
        data = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (5 - i));
          return expenses
            .filter(t => {
              const transDate = new Date(t.date);
              return transDate.getMonth() === date.getMonth() &&
                     transDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        });
        break;

      case 'yearly':
        // Last 5 years
        labels = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - (4 - i));
          return date.getFullYear().toString();
        });
        data = Array.from({ length: 5 }, (_, i) => {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - (4 - i));
          return expenses
            .filter(t => {
              const transDate = new Date(t.date);
              return transDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        });
        break;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-pulse text-neutral-200 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-neutral-200 hover:bg-[#2a2a2a] transition-colors duration-200"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 h-full w-64 bg-[#121212] border-r border-[#2a2a2a] z-40"
          >
            <div className="flex flex-col h-full">
              <div className="p-6">
                <span className="text-xl font-medium text-white">FinTrack</span>
              </div>
              
              <nav className="flex-1 px-3">
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-white bg-[#1a1a1a]"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/transactions"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors duration-200"
                  >
                    <Receipt className="w-5 h-5" />
                    <span>Transactions</span>
                  </Link>
                </div>
              </nav>

              <div className="p-4 border-t border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#5B8DEF] flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(session?.user?.name || '')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                    <p className="text-xs text-neutral-400">View Profile</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`lg:ml-64 min-h-screen transition-all duration-200`}>
        <div className="px-6 lg:px-12 pt-8 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-6">
            {/* Welcome Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="sm:col-span-4 lg:col-span-8 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div>
                <h1 className="text-2xl font-semibold text-white mb-2">
                  Welcome back, {session?.user?.name}!
                </h1>
                <p className="text-sm text-neutral-400">
                  Track and manage your finances with ease
                </p>
              </div>
            </motion.div>

            {/* Add Transaction Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sm:col-span-2 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <Link
                href="/add-transaction"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 w-full h-full"
              >
                <PlusCircle className="w-4 h-4" />
                Add Transaction
              </Link>
            </motion.div>

            {/* Financial Summary Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sm:col-span-2 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Total Balance</h2>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">
                    {formatAmount(totalBalance)}
                  </div>
                  <DollarSign className="w-6 h-6 text-[#5B8DEF]" />
                </div>
                <p className="text-sm text-neutral-400">
                  Your current balance
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sm:col-span-2 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Total Income</h2>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">
                    {formatAmount(totalIncome)}
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-neutral-400">
                  Total income this month
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sm:col-span-2 lg:col-span-4 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Total Expense</h2>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-white">
                    {formatAmount(totalExpense)}
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-neutral-400">
                  Total expenses this month
                </p>
              </div>
            </motion.div>

            {/* Monthly Budget Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="sm:col-span-6 lg:col-span-12 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Monthly Budget</h2>
                {overLimit && monthlyLimit !== null && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                    <strong>Warning:</strong> You have exceeded your monthly spending limit of {monthlyLimit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}!
                  </div>
                )}
                <form
                  ref={limitFormRef}
                  onSubmit={handleLimitSubmit}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={limitInput}
                    onChange={e => setLimitInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter monthly spending limit"
                    disabled={summaryLoading}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    disabled={summaryLoading}
                  >
                    {monthlyLimit === null ? 'Set Limit' : 'Update Limit'}
                  </button>
                </form>
                {summaryError && (
                  <div className="text-red-400 text-sm mt-2">{summaryError}</div>
                )}
              </div>
            </motion.div>

            {/* Expense Trends */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="sm:col-span-6 lg:col-span-12 bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Expense Trends</h2>
                  <div className="flex space-x-2">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                          timePeriod === period
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[300px]">
                  <Line data={getChartData()} options={chartOptions} />
                </div>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="sm:col-span-6 lg:col-span-12 bg-[#1a1a1a] rounded-2xl shadow-sm border border-[#2a2a2a] transition-all duration-200 hover:shadow-lg divide-y divide-[#2a2a2a]"
            >
              <div className="flex justify-between items-center p-6">
                <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
                <Link
                  href="/transactions"
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors duration-200 ease-in-out"
                >
                  View All
                </Link>
              </div>
              {error ? (
                <div className="text-red-400 text-sm text-center py-4">{error}</div>
              ) : loading ? (
                <div className="text-neutral-400 text-sm text-center py-4">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-neutral-400 text-sm text-center py-8">
                  No transactions yet. Add your first transaction to get started!
                </div>
              ) : (
                <div>
                  {transactions.slice(0, 5).map((transaction) => (
                    <motion.div
                      key={transaction._id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 hover:bg-[#2a2a2a] transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === 'income'
                              ? 'bg-green-500/10'
                              : 'bg-red-500/10'
                          }`}
                        >
                          <ArrowUpRight
                            className={`w-4 h-4 ${
                              transaction.type === 'income'
                                ? 'text-green-500'
                                : 'text-red-500 rotate-180'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {transaction.category}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            {transaction.type === 'income'
                              ? `From: ${transaction.sender}`
                              : `To: ${transaction.receiver}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            transaction.type === 'income'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatAmount(transaction.amount)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
} 