'use client';
import Link from 'next/link';
import { 
  Shield, 
  BarChart3, 
  PiggyBank, 
  CreditCard, 
  ArrowRight, 
  ChevronRight,
  Wallet,
  AlertCircle,
  Calendar,
  Settings,
  LineChart,
  Repeat,
  Globe,
  User,
  Tag,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Grid */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-16"
          >
            {/* Left Column - Text Content */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-6">
                <motion.h1 
                  variants={fadeInUp}
                  className="text-5xl md:text-6xl font-bold text-white leading-tight"
                >
                  Your Complete
                  <span className="text-blue-500 block mt-2">Financial Command Center</span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-neutral-400 max-w-xl"
                >
                  Take control of your finances with our comprehensive platform. Track expenses, 
                  set budgets, analyze spending patterns, and achieve your financial goals with 
                  powerful tools and insights.
                </motion.p>
              </div>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/signup"
                    className="group px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/login"
                    className="group px-8 py-4 text-lg font-semibold text-blue-500 border-2 border-blue-500 rounded-lg transition-all duration-200 hover:bg-blue-500/10 flex items-center justify-center"
                  >
                    Sign In
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Stats Cards */}
            <motion.div 
              variants={staggerContainer}
              className="flex items-center"
            >
              <div className="w-full bg-[#1a1a1a] rounded-2xl shadow-lg p-8 border border-[#2a2a2a]">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "100%", label: "Secure Authentication" },
                    { value: "15+", label: "Financial Features" },
                    { value: "24/7", label: "Transaction Tracking" },
                    { value: "Real-time", label: "Analytics" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      variants={cardVariants}
                      whileHover={{ scale: 1.02 }}
                      className="bg-neutral-900 rounded-xl p-6 transform transition-all duration-200 border border-[#2a2a2a]"
                    >
                      <div className="text-3xl font-bold text-blue-500 mb-2">{stat.value}</div>
                      <div className="text-neutral-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.section
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="pt-8 pb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-center text-white mb-10"
            >
              Comprehensive Financial Management
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Wallet className="w-6 h-6 text-blue-500" />,
                  title: "Transaction Management",
                  description: "Add, edit, and track all your financial transactions with detailed categorization."
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
                  title: "Smart Analytics",
                  description: "Visual insights into your spending patterns with category-wise summaries and trends."
                },
                {
                  icon: <AlertCircle className="w-6 h-6 text-blue-500" />,
                  title: "Budget Alerts",
                  description: "Set spending limits and receive instant notifications when you exceed your budget."
                },
                {
                  icon: <Calendar className="w-6 h-6 text-blue-500" />,
                  title: "Recurring Transactions",
                  description: "Automatically track regular payments and income with smart scheduling."
                },
                {
                  icon: <LineChart className="w-6 h-6 text-blue-500" />,
                  title: "Monthly Reports",
                  description: "Comprehensive monthly summaries with income vs expense comparisons."
                },
                {
                  icon: <PiggyBank className="w-6 h-6 text-blue-500" />,
                  title: "Savings Goals",
                  description: "Set and track your financial goals with progress monitoring and milestones."
                },
                {
                  icon: <Globe className="w-6 h-6 text-blue-500" />,
                  title: "Multi-Currency",
                  description: "Support for multiple currencies with real-time exchange rate updates."
                },
                {
                  icon: <Settings className="w-6 h-6 text-blue-500" />,
                  title: "Custom Settings",
                  description: "Personalize your experience with custom categories and preferences."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group bg-[#1a1a1a] rounded-2xl shadow-sm hover:shadow-lg p-6 transition-all duration-200 border border-[#2a2a2a]"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 border border-[#2a2a2a]"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[#1a1a1a] border-t border-[#2a2a2a] py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-neutral-400">
            © 2024 FinTrack. All rights reserved.
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
