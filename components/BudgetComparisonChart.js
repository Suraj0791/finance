"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { startOfMonth, endOfMonth } from "date-fns";

export default function BudgetComparisonChart({
  transactions,
  budgets,
  selectedMonth,
  selectedYear,
}) {
  const comparisonData = useMemo(() => {
    if (!budgets || budgets.length === 0) {
      return [];
    }

    const month = selectedMonth || new Date().getMonth() + 1;
    const year = selectedYear || new Date().getFullYear();

    // Filter budgets for selected month/year
    const monthBudgets = budgets.filter(
      (b) => b.month === month && b.year === year
    );

    if (monthBudgets.length === 0) {
      return [];
    }

    // Calculate actual spending for each budget category
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const actualSpending = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === "expense" &&
          transactionDate >= monthStart &&
          transactionDate <= monthEnd
        );
      })
      .reduce((acc, t) => {
        const category = t.category || "Other";
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {});

    return monthBudgets
      .map((budget) => {
        const actual = actualSpending[budget.category] || 0;
        const percentage =
          budget.budgetAmount > 0 ? (actual / budget.budgetAmount) * 100 : 0;

        return {
          category: budget.category,
          budget: budget.budgetAmount,
          actual: actual,
          remaining: Math.max(0, budget.budgetAmount - actual),
          percentage: Math.min(100, percentage),
          isOverBudget: actual > budget.budgetAmount,
        };
      })
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [transactions, budgets, selectedMonth, selectedYear]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Budget: {formatCurrency(data.budget)}
          </p>
          <p className="text-sm text-red-600">
            Actual: {formatCurrency(data.actual)}
          </p>
          <p className="text-sm text-green-600">
            Remaining: {formatCurrency(data.remaining)}
          </p>
          <p className="text-sm text-gray-600">
            {data.percentage.toFixed(1)}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };

  if (!budgets || budgets.length === 0 || comparisonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No budget data available. Set up budgets to track your spending.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(item.actual)} /{" "}
                    {formatCurrency(item.budget)}
                  </span>
                </div>
                <Progress
                  value={item.percentage}
                  className={`h-2 ${
                    item.isOverBudget ? "bg-red-100" : "bg-gray-200"
                  }`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.percentage.toFixed(1)}% used</span>
                  <span
                    className={
                      item.isOverBudget ? "text-red-600" : "text-green-600"
                    }
                  >
                    {item.isOverBudget
                      ? "Over budget"
                      : `${formatCurrency(item.remaining)} remaining`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="actual" fill="#ef4444" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
