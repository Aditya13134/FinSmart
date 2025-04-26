import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GlobalBudget from '@/models/globalBudget';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year required' }, { status: 400 });
    }
    await connectDB();
    const budget = await GlobalBudget.findOne({ month: parseInt(month), year: parseInt(year) });
    return NextResponse.json(budget || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch global budget' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, month, year } = body;
    
    // Improved validation to handle zero values
    if (amount === undefined || month === undefined || year === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find existing budget for this month/year
    const existing = await GlobalBudget.findOne({ 
      month: Number(month), 
      year: Number(year) 
    });
    
    let budget;
    if (existing) {
      // Update existing budget
      existing.amount = Number(amount);
      await existing.save();
      budget = existing;
    } else {
      // Create new budget
      budget = await GlobalBudget.create({ 
        amount: Number(amount), 
        month: Number(month), 
        year: Number(year) 
      });
    }
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error saving global budget:', error);
    return NextResponse.json({ error: 'Failed to save global budget' }, { status: 500 });
  }
}
