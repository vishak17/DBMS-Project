import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import BudgetGoal from '@/models/BudgetGoal';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    
    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));
    const goal = await BudgetGoal.findOne({ userId });
    return NextResponse.json(goal ? { monthlyLimit: goal.monthlyLimit } : { monthlyLimit: null }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching limit:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch limit' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monthlyLimit } = await req.json();
    if (typeof monthlyLimit !== 'number' || monthlyLimit <= 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }

    await connectDB();

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Create or update the budget goal
    const updated = await BudgetGoal.findOneAndUpdate(
      { userId },
      { monthlyLimit },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({ monthlyLimit: updated.monthlyLimit }, { status: 200 });
  } catch (error: any) {
    console.error('Error setting limit:', error);
    return NextResponse.json({ error: error.message || 'Failed to set limit' }, { status: 500 });
  }
} 