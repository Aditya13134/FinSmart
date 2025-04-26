import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/budget';
import Category from '@/models/category';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find and delete the budget
    const deletedBudget = await Budget.findByIdAndDelete(id);
    
    if (!deletedBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { category, amount, month, year } = body;
    
    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find the budget to update
    const existingBudget = await Budget.findById(id);
    
    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    // Get category information
    const categoryInfo = await Category.findById(category);
    const categoryName = categoryInfo ? categoryInfo.name : 'Uncategorized';
    
    try {
      // Check if there's already a budget with the same category/month/year (excluding this one)
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
      
      // Update the budget
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
    
    // Return the updated budget with category name for display
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
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}
