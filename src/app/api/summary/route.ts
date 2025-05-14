import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import BudgetGoal from '@/models/BudgetGoal';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);

    // Get the first and last day of the current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate total expenses for the current month
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: firstDay, $lte: lastDay },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
        },
      },
    ]);
    const totalExpenses = expenseAgg[0]?.totalExpenses || 0;

    // Fetch the user's monthly limit
    const goal = await BudgetGoal.findOne({ userId: userObjectId });
    const monthlyLimit = goal?.monthlyLimit || null;

    // Determine if the limit is exceeded
    const overLimit = monthlyLimit !== null && totalExpenses > monthlyLimit;

    return NextResponse.json({
      totalExpenses,
      monthlyLimit,
      overLimit,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch summary' }, { status: 500 });
  }
} 