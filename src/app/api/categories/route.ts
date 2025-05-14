import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Transaction from '@/models/Transaction';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // Build query
    const query: any = { userId: session.user.id };
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .select('name icon emoji color')
      .sort({ name: 1 })
      .lean();

    console.log('Fetched categories:', categories); // Debug log

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, emoji, type } = await request.json();
    console.log('Received category data:', { name, emoji, type }); // Debug log

    if (!name || !emoji) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Connected to MongoDB'); // Debug log

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      userId: session.user.id,
      name: name.trim()
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Generate a random color
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#E74C3C',
      '#2ECC71', '#F1C40F', '#1ABC9C', '#95A5A6'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const categoryData = {
      name: name.trim(),
      emoji,
      icon: 'tag',
      color: randomColor,
      userId: session.user.id,
      type: type || 'expense'
    };

    console.log('Creating category with data:', categoryData); // Debug log

    const category = await Category.create(categoryData);
    console.log('Created category:', category); // Debug log

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const category = await Category.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default category' },
        { status: 400 }
      );
    }

    await category.deleteOne();
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
