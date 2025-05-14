import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ message: 'Database connection successful!' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Database connection failed: ' + error.message },
      { status: 500 }
    );
  }
} 