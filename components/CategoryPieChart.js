"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7300",
  "#8DD1E1",
  "#D0743C",
  "#FF6B9D",
];

export default function CategoryPieChart({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Filter only expenses for category breakdown
    const expenses = transactions.filter((t) => t.type === "expense");

    if (expenses.length === 0) {
      return [];
    }

    // Group by category
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const category = transaction.category || "Other";
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Convert to array format for pie chart
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: 0, // Will be calculated by Recharts
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!transactions || transactions.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No expense data to display. Add some expense transactions to see
            category breakdown.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value, entry) =>
                  `${value}: ${formatCurrency(entry.payload.value)}`
                }
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
