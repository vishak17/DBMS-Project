import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import BudgetGoal from '@/models/BudgetGoal';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    const connection = await connectDB();
    if (!connection) {
      throw new Error('Failed to connect to database');
    }

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Aggregate total expenses for the current month
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly limit from budget goal
    const budgetGoal = await BudgetGoal.findOne({ userId });
    const monthlyLimit = budgetGoal?.monthlyLimit || null;

    // Calculate if over limit
    const totalExpenses = expenseAgg[0]?.total || 0;
    const overLimit = monthlyLimit !== null && totalExpenses > monthlyLimit;

    return NextResponse.json({
      monthlyLimit,
      overLimit,
      totalExpenses
    });
  } catch (error: any) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch summary' },
      { status: 500 }
    );
  }
} 