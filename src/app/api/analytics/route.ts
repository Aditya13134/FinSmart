import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Transaction from '@/models/transaction';
import Budget from '@/models/budget';
import Category from '@/models/category';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year parameters are required' },
        { status: 400 }
      );
    }
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    await connectDB();
    
    // Calculate start and end dates for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    // Get all transactions for the month
    const transactions = await Transaction.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Get all budgets for the month
    const budgets = await Budget.find({
      month: monthNum,
      year: yearNum
    });
    
    // Calculate previous month's date
    let prevMonthNum = monthNum - 1;
    let prevYearNum = yearNum;
    if (prevMonthNum === 0) {
      prevMonthNum = 12;
      prevYearNum = yearNum - 1;
    }
    
    // Get previous month's transactions to calculate balance carried forward
    const prevMonthStartDate = new Date(prevYearNum, prevMonthNum - 1, 1);
    const prevMonthEndDate = new Date(prevYearNum, prevMonthNum, 0);
    
    const prevMonthTransactions = await Transaction.find({
      date: {
        $gte: prevMonthStartDate,
        $lte: prevMonthEndDate
      }
    });
    
    // Calculate previous month's income and expenses
    const prevMonthIncome = prevMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const prevMonthExpenses = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate previous month's balance (to be carried forward)
    const prevMonthBalance = prevMonthIncome - prevMonthExpenses;
    
    // Calculate total expenses for current month from transactions
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate current month income from transactions
    const currentMonthIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Get global monthly budget from settings
    // Default to 12000 if not set
    const globalMonthlyBudget = 12000; // This should be fetched from settings in a real implementation
    
    // Calculate total allocated budget (sum of all budget amounts)
    const totalAllocatedBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    
    // Total income is the global monthly budget plus previous month's balance (if positive)
    const totalIncome = globalMonthlyBudget + Math.max(0, prevMonthBalance);
    
    // Current balance is the global monthly budget minus allocated budgets plus previous month's balance
    const currentBalance = globalMonthlyBudget - totalAllocatedBudget + prevMonthBalance;
    
    // Net savings is the difference between total income and expenses
    const netSavings = totalIncome - totalExpenses;
    
    // Count the number of transactions for the month
    const transactionCount = transactions.length;
    
    console.log('Analytics calculation:', {
      currentMonthIncome,
      globalMonthlyBudget,
      totalAllocatedBudget,
      totalExpenses,
      prevMonthBalance,
      totalIncome,
      currentBalance,
      netSavings,
      transactionCount
    });
    
    // Get all categories for proper naming
    const categories = await Category.find({});
    const categoryMap: Record<string, string> = {};
    categories.forEach((cat: any) => {
      categoryMap[cat._id.toString()] = cat.name;
    });
    
    // Calculate expenses by category with proper names
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryId = t.category ? t.category.toString() : null;
        const categoryName = categoryId && categoryMap[categoryId] ? categoryMap[categoryId] : 'Uncategorized';
        
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += t.amount;
        return acc;
      }, {});
    
    // We already calculated net savings above as totalIncome - totalExpenses
    
    // Calculate budget comparison
    const budgetComparison = [];
    
    for (const budget of budgets) {
      const categoryExpenses = transactions
        .filter(t => t.type === 'expense' && t.category?.toString() === budget.category?.toString())
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = budget.amount > 0 ? (categoryExpenses / budget.amount) * 100 : 0;
      
      budgetComparison.push({
        category: budget.category,
        budgeted: budget.amount,
        spent: categoryExpenses,
        percentage
      });
    }
    
    return NextResponse.json({
      totalIncome,
      currentMonthIncome,
      totalExpenses,
      netSavings,
      currentBalance,
      prevMonthBalance,
      transactionCount,
      expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount
      })),
      budgetComparison
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
