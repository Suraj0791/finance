import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let query = {};
    if (month && year) {
      query = { month: parseInt(month), year: parseInt(year) };
    }

    const budgets = await Budget.find(query).sort({ category: 1 });
    return NextResponse.json({ budgets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { category, budgetAmount, month, year } = body;
    
    // Validation
    if (!category || !budgetAmount || !month || !year) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (budgetAmount <= 0) {
      return NextResponse.json(
        { error: 'Budget amount must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }
    
    const budget = new Budget({
      category: category.trim(),
      budgetAmount: parseFloat(budgetAmount),
      month: parseInt(month),
      year: parseInt(year),
    });
    
    await budget.save();
    
    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Budget for this category and month already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
