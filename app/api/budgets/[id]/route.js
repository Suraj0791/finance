import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const { category, budgetAmount, month, year } = body;

    // Validation
    if (!category || !budgetAmount || !month || !year) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (budgetAmount <= 0) {
      return NextResponse.json(
        { error: "Budget amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    const budget = await Budget.findByIdAndUpdate(
      params.id,
      {
        category: category.trim(),
        budgetAmount: parseFloat(budgetAmount),
        month: parseInt(month),
        year: parseInt(year),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget }, { status: 200 });
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const budget = await Budget.findByIdAndDelete(params.id);

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Budget deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
