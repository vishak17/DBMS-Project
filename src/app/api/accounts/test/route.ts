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

    // Create a test account
    const testAccount = await Account.create({
      userId,
      accountType: 'checking',
      balance: 1000
    });

    return NextResponse.json({
      message: 'Test account created successfully',
      account: testAccount
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating test account:', error);
    return NextResponse.json({ error: error.message || 'Failed to create test account' }, { status: 500 });
  }
} 