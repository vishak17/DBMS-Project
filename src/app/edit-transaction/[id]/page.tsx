'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

interface TransactionFormData {
  amount: number;
  category: string;
  type: 'income' | 'expense';
  sender: string;
  receiver: string;
  date: string;
  note?: string;
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'],
  expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other']
};

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TransactionFormData>();

  const transactionType = watch('type');

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await fetch(`/api/transactions/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transaction');
      }

      const data = await response.json();
      
      // Set form values
      setValue('amount', data.amount);
      setValue('category', data.category);
      setValue('type', data.type);
      setValue('sender', data.sender);
      setValue('receiver', data.receiver);
      setValue('date', new Date(data.date).toISOString().split('T')[0]);
      setValue('note', data.note || '');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      setSuccess('Transaction updated successfully!');
      setTimeout(() => {
        router.push('/transactions');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/transactions"
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Transactions
        </Link>
        <h1 className="text-2xl font-bold">Edit Transaction</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: 'Amount is required', min: 0 })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            {...register('type', { required: 'Type is required' })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="">Select type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="w-full p-2 border rounded"
            disabled={isLoading || !transactionType}
          >
            <option value="">Select category</option>
            {transactionType && CATEGORIES[transactionType].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sender</label>
          <input
            type="text"
            {...register('sender', { required: 'Sender is required' })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          {errors.sender && (
            <p className="text-red-500 text-sm mt-1">{errors.sender.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Receiver</label>
          <input
            type="text"
            {...register('receiver', { required: 'Receiver is required' })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          {errors.receiver && (
            <p className="text-red-500 text-sm mt-1">{errors.receiver.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Note (Optional)</label>
          <textarea
            {...register('note')}
            className="w-full p-2 border rounded"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Updating Transaction...' : 'Update Transaction'}
        </button>
      </form>
    </div>
  );
} 