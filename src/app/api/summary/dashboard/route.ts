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

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const result = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
                },
                totalExpenses: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalIncome: 1,
                totalExpenses: 1,
                netBalance: { $subtract: ['$totalIncome', '$totalExpenses'] },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: { category: '$category', type: '$type' },
                total: { $sum: '$amount' },
              },
            },
            {
              $project: {
                _id: 0,
                category: '$_id.category',
                type: '$_id.type',
                total: 1,
              },
            },
            { $sort: { total: -1 } },
          ],
          monthlyTrend: [
            {
              $match: { date: { $gte: sixMonthsAgo } },
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
          ],
        },
      },
    ]);

    const data = result[0] || {};
    return NextResponse.json({
      totals: data.totals?.[0] || { totalIncome: 0, totalExpenses: 0, netBalance: 0 },
      categoryBreakdown: data.categoryBreakdown || [],
      monthlyTrend: data.monthlyTrend || [],
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard summary' }, { status: 500 });
  }
} 