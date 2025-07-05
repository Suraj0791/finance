"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
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
        setShowForm(false);
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

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleCancelAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Personal Finance Tracker
            </h1>
            <p className="text-gray-600 mt-2">Track your income and expenses</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            disabled={showForm || editingTransaction}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {(showForm || editingTransaction) && (
              <TransactionForm
                onSubmit={
                  editingTransaction
                    ? handleUpdateTransaction
                    : handleAddTransaction
                }
                onCancel={
                  editingTransaction ? handleCancelEdit : handleCancelAdd
                }
                initialData={editingTransaction}
              />
            )}

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
      </div>
    </div>
  );
}
