'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export default function SpendingInsights({ transactions, budgets }) {
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const currentDate = new Date();
    const currentMonth = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);
    const lastMonth = startOfMonth(subMonths(currentDate, 1));
    const lastMonthEnd = endOfMonth(subMonths(currentDate, 1));

    const insights = [];

    // Current month expenses
    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date >= currentMonth && date <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Last month expenses
    const lastMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date >= lastMonth && date <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Month-over-month comparison
    if (lastMonthExpenses > 0) {
      const change = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
      insights.push({
        id: 'monthly_trend',
        type: change > 0 ? 'warning' : 'success',
        icon: change > 0 ? TrendingUp : TrendingDown,
        title: 'Monthly Spending Trend',
        description: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last month`,
        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
      });
    }

    // Budget analysis
    if (budgets && budgets.length > 0) {
      const currentMonthBudgets = budgets.filter(b => 
        b.month === currentDate.getMonth() + 1 && 
        b.year === currentDate.getFullYear()
      );

      if (currentMonthBudgets.length > 0) {
        const categorySpending = transactions
          .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= currentMonth && date <= currentMonthEnd;
          })
          .reduce((acc, t) => {
            const category = t.category || 'Other';
            acc[category] = (acc[category] || 0) + t.amount;
            return acc;
          }, {});

        let overBudgetCategories = 0;
        let totalBudgetVariance = 0;

        currentMonthBudgets.forEach(budget => {
          const spent = categorySpending[budget.category] || 0;
          const variance = spent - budget.budgetAmount;
          
          if (variance > 0) {
            overBudgetCategories++;
            totalBudgetVariance += variance;
          }
        });

        if (overBudgetCategories > 0) {
          insights.push({
            id: 'budget_warning',
            type: 'error',
            icon: AlertTriangle,
            title: 'Budget Alert',
            description: `You're over budget in ${overBudgetCategories} ${overBudgetCategories === 1 ? 'category' : 'categories'}`,
            value: `$${totalBudgetVariance.toFixed(2)} over`
          });
        } else {
          insights.push({
            id: 'budget_success',
            type: 'success',
            icon: CheckCircle,
            title: 'Budget Status',
            description: 'You\'re staying within your budgets this month!',
            value: 'On track'
          });
        }
      }
    }

    // Top spending category this month
    const currentMonthByCategory = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date >= currentMonth && date <= currentMonthEnd;
      })
      .reduce((acc, t) => {
        const category = t.category || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {});

    const topCategory = Object.entries(currentMonthByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      insights.push({
        id: 'top_category',
        type: 'info',
        icon: TrendingUp,
        title: 'Top Spending Category',
        description: `${topCategory[0]} is your highest expense category this month`,
        value: `$${topCategory[1].toFixed(2)}`
      });
    }

    // Average transaction amount
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date >= currentMonth && date <= currentMonthEnd;
    });

    if (currentMonthTransactions.length > 0) {
      const avgAmount = currentMonthExpenses / currentMonthTransactions.length;
      insights.push({
        id: 'avg_transaction',
        type: 'info',
        icon: TrendingUp,
        title: 'Average Transaction',
        description: `Your average expense transaction this month`,
        value: `$${avgAmount.toFixed(2)}`
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  }, [transactions, budgets]);

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Add more transactions to get personalized spending insights.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm opacity-80">{insight.description}</p>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(insight.type)}>
                    {insight.value}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
