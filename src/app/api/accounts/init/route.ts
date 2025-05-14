import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Account from '@/models/Account';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Check if user already has an account
    const existingAccount = await Account.findOne({ userId });
    if (existingAccount) {
      return NextResponse.json({ 
        message: 'Account already initialized',
        account: existingAccount 
      });
    }

    // Create a new account with initial values
    const account = await Account.create({
      userId,
      balance: 0,
      totalIncome: 0,
      totalExpenses: 0
    });

    console.log('Created new account:', account);

    return NextResponse.json({
      message: 'Account initialized successfully',
      account
    });
  } catch (error: any) {
    console.error('Error initializing account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize account' },
      { status: 500 }
    );
  }
} 