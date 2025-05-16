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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const type = searchParams.get('type') || 'expense'; // Default to expense if not specified

    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);

    // Parse the month parameter
    let startDate: Date, endDate: Date;
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0);
    } else {
      // Default to current month if no month specified
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const summary = await Transaction.aggregate([
      // Match transactions for the current user, specified type, and date range
      {
        $match: {
          userId: userObjectId,
          type: type,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      // Group by category and calculate total amount
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      // Sort by total amount in descending order
      {
        $sort: { total: -1 }
      },
      // Reshape the output
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1
        }
      }
    ]);

    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching category monthly summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category monthly summary' },
      { status: 500 }
    );
  }
} 