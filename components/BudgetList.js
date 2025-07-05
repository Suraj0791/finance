'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

export default function BudgetList({ budgets, onEdit, onDelete, loading = false }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting budget:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading budgets...</div>
        </CardContent>
      </Card>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No budgets set yet. Create your first budget to start tracking your spending!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Budgets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div
              key={budget._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{budget.category}</span>
                  <Badge variant="outline" className="text-xs">
                    {getMonthName(budget.month)} {budget.year}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Monthly Budget
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-semibold text-blue-600">
                  {formatCurrency(budget.budgetAmount)}
                </span>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(budget)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(budget._id)}
                    disabled={deletingId === budget._id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
