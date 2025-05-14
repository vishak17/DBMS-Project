import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = { userId: session.user.id };
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .select('amount category type sender receiver date description')
      .sort({ date: -1 })
      .lean();

    console.log('Fetched transactions:', JSON.stringify(transactions, null, 2));

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, description, date, category, sender, receiver } = await req.json();

    // Validate required fields
    if (!amount || !type || !date || !category || !sender || !receiver) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          received: { type, amount, description, date, category, sender, receiver },
          missing: {
            amount: !amount,
            category: !category,
            type: !type,
            sender: !sender,
            receiver: !receiver,
            date: !date
          }
        },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      date,
      category, // Store the category name directly
      sender,
      receiver,
      userId: session.user.id
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 