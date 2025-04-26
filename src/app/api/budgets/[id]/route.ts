import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/budget';
import Category from '@/models/category';

// DELETE handler
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    const deletedBudget = await Budget.findByIdAndDelete(id);
    
    if (!deletedBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Budget deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
    }
    
    const body = await req.json();
    const { category, amount, month, year } = body;
    
    if (!category || !amount || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await connectDB();
    
    const existingBudget = await Budget.findById(id);
    
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    const categoryInfo = await Category.findById(category);
    const categoryName = categoryInfo ? categoryInfo.name : 'Uncategorized';
    
    try {
      const duplicateBudget = await Budget.findOne({
        _id: { $ne: id },
        category: category,
        month: month,
        year: year
      });
      
      if (duplicateBudget) {
        return NextResponse.json(
          { error: 'A budget for this category already exists for the selected month and year' },
          { status: 409 }
        );
      }
      
      existingBudget.category = category;
      existingBudget.amount = amount;
      existingBudget.month = month;
      existingBudget.year = year;
      
      await existingBudget.save();
    } catch (saveError) {
      console.error('Error saving budget:', saveError);
      return NextResponse.json(
        { error: 'Failed to update budget due to a conflict. A budget for this category may already exist.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({
      id: existingBudget._id,
      category: categoryName,
      categoryId: category,
      amount,
      month,
      year,
      message: 'Budget updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}
