import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import mongoose, { ClientSession } from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = { userId };
    
    // Add filters if provided
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .select('amount category type sender receiver date description')
      .sort({ date: -1 })
      .lean();

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
  let dbSession: ClientSession | null = null;
  
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, amount, description, date, category, sender, receiver } = await req.json();

    if (!type || !amount || !category || !sender || !receiver) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Start a new session
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(authSession.user.id.padStart(24, '0'));

    // Find or create account
    let account = await Account.findOne({ userId }).session(dbSession);
    if (!account) {
      const newAccounts = await Account.create([{
        userId,
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
      }], { session: dbSession });
      account = newAccounts[0];
    }

    // Create the transaction
    const newTransactions = await Transaction.create([{
      type,
      amount,
      description,
      date: date || new Date(),
      category,
      sender,
      receiver,
      userId
    }], { session: dbSession });
    const transaction = newTransactions[0];

    // Update account balance
    if (type === 'income') {
      account.balance += amount;
      account.totalIncome += amount;
    } else {
      if (account.balance < amount) {
        await dbSession.abortTransaction();
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
      account.balance -= amount;
      account.totalExpenses += amount;
    }

    await account.save({ session: dbSession });

    // Commit the transaction
    await dbSession.commitTransaction();

    return NextResponse.json({
      transaction,
      account: {
        balance: account.balance,
        totalIncome: account.totalIncome,
        totalExpenses: account.totalExpenses
      }
    });
  } catch (error: any) {
    if (dbSession) {
      try {
        await dbSession.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      }
    }
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  } finally {
    if (dbSession) {
      try {
        dbSession.endSession();
      } catch (endError) {
        console.error('Error ending session:', endError);
      }
    }
  }
} 