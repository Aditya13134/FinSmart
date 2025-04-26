import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const category = await Category.create({
      name,
      color: color || '#6366f1',
      icon,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
