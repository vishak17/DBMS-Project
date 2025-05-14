import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const { amount, category, type, sender, receiver, date, note } = body;

    const transaction = await Transaction.create({
      userId: session.user.id,
      amount,
      category,
      type,
      sender,
      receiver,
      date: new Date(date),
      note,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 