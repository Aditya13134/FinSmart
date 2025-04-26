import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/budget';
import Category from '@/models/category';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    const query: any = {};
    
    if (month && year) {
      query.month = parseInt(month, 10);
      query.year = parseInt(year, 10);
    }
    
    await connectDB();
    
    // Get all budgets for the query
    const budgets = await Budget.find(query);
    
    // Get all categories to map them to budgets
    const categories = await Category.find({});
    const categoryMap: Record<string, { name: string; color: string }> = {};
    categories.forEach((cat: any) => {
      categoryMap[cat._id.toString()] = {
        name: cat.name,
        color: cat.color || '#6366f1'
      };
    });
    
    // Generate a color palette for the categories if they don't have colors
    const colors = [
      '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c',
      '#d0ed57', '#ffc658', '#ff8042', '#ff6361', '#bc5090',
    ];
    
    // Format the budget data with category information
    const formattedBudgets = budgets.map((budget, index) => {
      const categoryId = budget.category ? budget.category.toString() : null;
      const categoryInfo = categoryId && categoryMap[categoryId] 
        ? categoryMap[categoryId] 
        : { name: 'Uncategorized', color: colors[index % colors.length] };
      
      return {
        id: budget._id,
        _id: budget._id,
        categoryId: categoryId,
        category: categoryInfo.name,
        amount: budget.amount,
        color: categoryInfo.color,
        month: budget.month,
        year: budget.year
      };
    });
    
    return NextResponse.json({ budgets: formattedBudgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, amount, month, year } = body;

    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get category information
    const categoryInfo = await Category.findById(category);
    if (!categoryInfo) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if budget already exists for this category, month, and year
    const existingBudget = await Budget.findOne({
      category,
      month,
      year
    });
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = amount;
      await existingBudget.save();
      
      // Return with category information
      return NextResponse.json({
        id: existingBudget._id,
        _id: existingBudget._id,
        category: categoryInfo.name,
        categoryId: category,
        amount: existingBudget.amount,
        color: categoryInfo.color || '#6366f1',
        month: existingBudget.month,
        year: existingBudget.year
      });
    }
    
    // Create new budget
    const budget = await Budget.create({
      category,
      amount,
      month,
      year
    });

    // Return with category information
    return NextResponse.json({
      id: budget._id,
      _id: budget._id,
      category: categoryInfo.name,
      categoryId: category,
      amount: budget.amount,
      color: categoryInfo.color || '#6366f1',
      month: budget.month,
      year: budget.year
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
