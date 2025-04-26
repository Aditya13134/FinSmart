import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/transaction';

export async function GET() {
  try {
    await connectDB();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, date, description, category, type } = body;

    if (!amount || !date || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();
    const transaction = await Transaction.create({
      amount,
      date,
      description,
      category,
      type,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
