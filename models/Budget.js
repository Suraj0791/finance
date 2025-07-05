import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  budgetAmount: {
    type: Number,
    required: [true, "Budget amount is required"],
    min: [0, "Budget amount must be positive"],
  },
  month: {
    type: Number,
    required: [true, "Month is required"],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, "Year is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique budget per category per month
BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

BudgetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
