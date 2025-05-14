import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import BudgetGoal from '@/models/BudgetGoal';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);
    const goal = await BudgetGoal.findOne({ userId: userObjectId });
    return NextResponse.json(goal ? { monthlyLimit: goal.monthlyLimit } : { monthlyLimit: null }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch limit' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);
    const { monthlyLimit } = await req.json();
    if (typeof monthlyLimit !== 'number' || monthlyLimit <= 0) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 });
    }
    const updated = await BudgetGoal.findOneAndUpdate(
      { userId: userObjectId },
      { $set: { monthlyLimit } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ monthlyLimit: updated.monthlyLimit }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to set limit' }, { status: 500 });
  }
} 