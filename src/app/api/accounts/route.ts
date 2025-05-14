import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Account from '@/models/Account';
import mongoose from 'mongoose';

// Get account summary for the user
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

    // Find or create account
    let account = await Account.findOne({ userId });
    if (!account) {
      account = await Account.create({
        userId,
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
      });
    }

    return NextResponse.json({
      balance: account.balance,
      totalIncome: account.totalIncome,
      totalExpenses: account.totalExpenses
    });
  } catch (error: any) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// Update account totals
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, type } = await req.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    // Connect to MongoDB
    const connection = await connectDB();
    if (!connection) {
      throw new Error('Failed to connect to database');
    }

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Update account based on transaction type
    const update = type === 'income' 
      ? { 
          $inc: { 
            balance: amount,
            totalIncome: amount
          }
        }
      : {
          $inc: {
            balance: -amount,
            totalExpenses: amount
          }
        };

    const account = await Account.findOneAndUpdate(
      { userId },
      update,
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: error.message || 'Failed to update account' }, { status: 500 });
  }
} 