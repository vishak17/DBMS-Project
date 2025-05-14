import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import mongoose from 'mongoose';

const DEFAULT_CATEGORIES = [
  // Expense Categories
  {
    name: 'Food & Dining',
    icon: 'utensils',
    emoji: '🍔',
    color: '#FF6B6B',
    type: 'expense'
  },
  {
    name: 'Shopping',
    icon: 'shopping-bag',
    emoji: '🛍️',
    color: '#4ECDC4',
    type: 'expense'
  },
  {
    name: 'Transportation',
    icon: 'car',
    emoji: '🚗',
    color: '#45B7D1',
    type: 'expense'
  },
  {
    name: 'Housing',
    icon: 'home',
    emoji: '🏠',
    color: '#96CEB4',
    type: 'expense'
  },
  {
    name: 'Utilities',
    icon: 'bolt',
    emoji: '💡',
    color: '#FFEEAD',
    type: 'expense'
  },
  {
    name: 'Entertainment',
    icon: 'film',
    emoji: '🎬',
    color: '#D4A5A5',
    type: 'expense'
  },
  {
    name: 'Healthcare',
    icon: 'heart-pulse',
    emoji: '⚕️',
    color: '#9B59B6',
    type: 'expense'
  },
  {
    name: 'Education',
    icon: 'graduation-cap',
    emoji: '📚',
    color: '#3498DB',
    type: 'expense'
  },
  {
    name: 'Travel',
    icon: 'plane',
    emoji: '✈️',
    color: '#E67E22',
    type: 'expense'
  },
  {
    name: 'Gifts Given',
    icon: 'gift',
    emoji: '🎁',
    color: '#E74C3C',
    type: 'expense'
  },
  // Income Categories
  {
    name: 'Salary',
    icon: 'briefcase',
    emoji: '💰',
    color: '#2ECC71',
    type: 'income'
  },
  {
    name: 'Freelance',
    icon: 'laptop',
    emoji: '💻',
    color: '#F1C40F',
    type: 'income'
  },
  {
    name: 'Investments',
    icon: 'chart-line',
    emoji: '📈',
    color: '#1ABC9C',
    type: 'income'
  },
  {
    name: 'Gifts Received',
    icon: 'gift',
    emoji: '🎁',
    color: '#E74C3C',
    type: 'income'
  },
  {
    name: 'Other Income',
    icon: 'plus-circle',
    emoji: '➕',
    color: '#95A5A6',
    type: 'income'
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Convert numeric string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id.padStart(24, '0'));

    // Check if user already has categories
    const existingCategories = await Category.find({ userId });
    if (existingCategories.length > 0) {
      return NextResponse.json({ message: 'Categories already initialized' });
    }

    // Create default categories for the user
    const categories = await Category.insertMany(
      DEFAULT_CATEGORIES.map(category => ({
        ...category,
        userId,
        isDefault: true
      }))
    );

    return NextResponse.json({
      message: 'Default categories initialized successfully',
      categories
    });
  } catch (error: any) {
    console.error('Error initializing categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize categories' },
      { status: 500 }
    );
  }
} 