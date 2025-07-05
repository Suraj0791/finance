"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import DashboardSummary from "@/components/DashboardSummary";
import BudgetForm from "@/components/BudgetForm";
import BudgetList from "@/components/BudgetList";
import BudgetComparisonChart from "@/components/BudgetComparisonChart";
import SpendingInsights from "@/components/SpendingInsights";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions);
      } else {
        setError(data.error || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      setBudgetsLoading(true);
      const currentDate = new Date();
      const response = await fetch(
        `/api/budgets?month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`
      );
      const data = await response.json();

      if (response.ok) {
        setBudgets(data.budgets);
      } else {
        console.error("Failed to fetch budgets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setBudgetsLoading(false);
    }
  };

  const handleAddTransaction = async (formData) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setTransactions((prev) => [data.transaction, ...prev]);
        setShowTransactionForm(false);
        setError("");
      } else {
        setError(data.error || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Failed to add transaction");
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      const response = await fetch(
        `/api/transactions/${editingTransaction._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTransactions((prev) =>
          prev.map((t) =>
            t._id === editingTransaction._id ? data.transaction : t
          )
        );
        setEditingTransaction(null);
        setError("");
      } else {
        setError(data.error || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setError("Failed to delete transaction");
    }
  };

  const handleAddBudget = async (formData) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setBudgets((prev) => [data.budget, ...prev]);
        setShowBudgetForm(false);
        setError("");
      } else {
        setError(data.error || "Failed to add budget");
      }
    } catch (error) {
      console.error("Error adding budget:", error);
      setError("Failed to add budget");
    }
  };

  const handleUpdateBudget = async (formData) => {
    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setBudgets((prev) =>
          prev.map((b) => (b._id === editingBudget._id ? data.budget : b))
        );
        setEditingBudget(null);
        setError("");
      } else {
        setError(data.error || "Failed to update budget");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      setError("Failed to update budget");
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBudgets((prev) => prev.filter((b) => b._id !== id));
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      setError("Failed to delete budget");
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(false);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(false);
  };

  const handleCancelEditTransaction = () => {
    setEditingTransaction(null);
  };

  const handleCancelEditBudget = () => {
    setEditingBudget(null);
  };

  const handleCancelAddTransaction = () => {
    setShowTransactionForm(false);
  };

  const handleCancelAddBudget = () => {
    setShowBudgetForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-600 mt-2">
              Complete financial management solution
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                console.log("Add Transaction clicked");
                setShowTransactionForm(true);
                setActiveTab("transactions");
              }}
              disabled={showTransactionForm || editingTransaction}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button
              type="button"
              onClick={() => {
                console.log("Set Budget clicked");
                setShowBudgetForm(true);
                setActiveTab("budgets");
              }}
              disabled={showBudgetForm || editingBudget}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Set Budget
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardSummary transactions={transactions} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyExpensesChart transactions={transactions} />
              <SpendingInsights transactions={transactions} budgets={budgets} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {(showTransactionForm || editingTransaction) && (
                  <TransactionForm
                    onSubmit={
                      editingTransaction
                        ? handleUpdateTransaction
                        : handleAddTransaction
                    }
                    onCancel={
                      editingTransaction
                        ? handleCancelEditTransaction
                        : handleCancelAddTransaction
                    }
                    initialData={editingTransaction}
                  />
                )}
                {/* Debug info */}
                <div className="text-sm text-gray-500">
                  showTransactionForm: {showTransactionForm.toString()},
                  editingTransaction: {editingTransaction ? "true" : "false"}
                </div>

                <MonthlyExpensesChart transactions={transactions} />
              </div>

              <div>
                <TransactionList
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTransaction}
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart transactions={transactions} />
              <DashboardSummary transactions={transactions} />
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            {(showBudgetForm || editingBudget) && (
              <div className="flex justify-center">
                <BudgetForm
                  onSubmit={
                    editingBudget ? handleUpdateBudget : handleAddBudget
                  }
                  onCancel={
                    editingBudget
                      ? handleCancelEditBudget
                      : handleCancelAddBudget
                  }
                  initialData={editingBudget}
                />
              </div>
            )}
            {/* Debug info */}
            <div className="text-sm text-gray-500">
              showBudgetForm: {showBudgetForm.toString()}, editingBudget:{" "}
              {editingBudget ? "true" : "false"}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetList
                budgets={budgets}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
                loading={budgetsLoading}
              />
              <BudgetComparisonChart
                transactions={transactions}
                budgets={budgets}
                selectedMonth={new Date().getMonth() + 1}
                selectedYear={new Date().getFullYear()}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
