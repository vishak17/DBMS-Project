import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);

    // Get the date 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          income: 1,
          expense: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching monthly summary:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch monthly summary' }, { status: 500 });
  }
} 