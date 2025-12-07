import React, { useState, useEffect, useMemo } from "react";
import { Transaction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TransactionForm from "../components/transactions/TransactionForm";
import MetricCard from "../components/dashboard/MetricCard";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', category: 'all', quarter: 'all' });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await Transaction.list('-date');
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, formData);
      } else {
        await Transaction.create(formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await Transaction.delete(id);
        loadTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const quarters = useMemo(() => {
    const q = new Set(transactions.map(t => t.quarter).filter(Boolean));
    return Array.from(q).sort().reverse();
  }, [transactions]);

  const categories = useMemo(() => {
    const c = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(c).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const typeMatch = filters.type === 'all' || t.type === filters.type;
      const categoryMatch = filters.category === 'all' || t.category === filters.category;
      const quarterMatch = filters.quarter === 'all' || t.quarter === filters.quarter;
      const tabMatch = activeTab === 'all' || t.type === activeTab;
      return typeMatch && categoryMatch && quarterMatch && tabMatch;
    });
  }, [transactions, filters, activeTab]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const getCategoryColor = (category) => {
    const colors = {
      rent: "bg-green-100 text-green-800",
      mortgage: "bg-red-100 text-red-800", 
      insurance: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      repairs: "bg-yellow-100 text-yellow-800",
      utilities: "bg-purple-100 text-purple-800",
      property_management: "bg-indigo-100 text-indigo-800",
      legal_fees: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Transactions</h1>
              <p className="text-slate-600">Manage income and expenses for the apartment complex</p>
            </div>
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingTransaction(null); }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {showForm && (
            <div className="mb-8">
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingTransaction(null); }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard 
              title="Total Income" 
              value={`$${totalIncome.toLocaleString()}`} 
              icon={TrendingUp} 
              color="green" 
            />
            <MetricCard 
              title="Total Expenses" 
              value={`$${totalExpenses.toLocaleString()}`} 
              icon={TrendingDown} 
              color="orange" 
            />
            <MetricCard 
              title="Net Income" 
              value={`$${netIncome.toLocaleString()}`} 
              icon={DollarSign} 
              color={netIncome >= 0 ? "green" : "orange"} 
            />
          </div>

          <Card className="bg-white border border-slate-200">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex flex-wrap gap-4">
                  <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filters.quarter} onValueChange={(value) => setFilters(f => ({ ...f, quarter: value }))}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="income">Income Only</TabsTrigger>
                  <TabsTrigger value="expense">Expenses Only</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={7} className="text-center p-4">
                                <div className="animate-pulse h-6 bg-slate-100 rounded"></div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredTransactions.length > 0 ? (
                          filteredTransactions.map(t => (
                            <TableRow key={t.id}>
                              <TableCell>
                                <Badge className={`${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {t.type === 'income' ? '↗️ Income' : '↙️ Expense'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getCategoryColor(t.category)}>
                                  {t.category.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                ${t.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>{format(new Date(t.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                              <TableCell className="max-w-xs truncate">{t.vendor || '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500" 
                                    onClick={() => handleDelete(t.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center p-8 text-slate-500">
                              No transactions found for the selected filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}