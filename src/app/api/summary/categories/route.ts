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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'expense'; // Default to expense if not specified

    console.log('Fetching category summary for user:', session.user.id, 'type:', type);

    await connectDB();

    const userObjectId = new Types.ObjectId(session.user.id);

    const summary = await Transaction.aggregate([
      // Match transactions for the current user and specified type
      {
        $match: {
          userId: userObjectId,
          type: type
        }
      },
      // Group by category and calculate total amount
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
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
          total: 1
        }
      }
    ]);

    console.log('Aggregation result:', summary);

    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching category summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category summary' },
      { status: 500 }
    );
  }
} 