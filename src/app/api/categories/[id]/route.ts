import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Transaction from '@/models/Transaction';
import { Types } from 'mongoose';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, icon, color, monthlyBudget } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);
    const categoryId = new Types.ObjectId(params.id);

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, userId: userObjectId },
      {
        name: name.trim(),
        icon: icon || 'tag',
        color: color || '#3B82F6',
        monthlyBudget: monthlyBudget || null
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userObjectId = new Types.ObjectId(session.user.id);
    const categoryId = new Types.ObjectId(params.id);

    // Check if category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: userObjectId
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category is in use
    const usageCount = await Transaction.countDocuments({
      userId: userObjectId,
      category: category.name
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is in use by transactions' },
        { status: 400 }
      );
    }

    await category.deleteOne();
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
} 