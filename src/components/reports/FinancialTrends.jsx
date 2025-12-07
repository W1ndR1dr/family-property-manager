import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

export default function FinancialTrends({ contributions, transactions, isLoading }) {
  const monthlyData = useMemo(() => {
    const months = {};
    
    // Process contributions
    contributions.forEach(c => {
      const date = new Date(c.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, contributions: 0, income: 0, expenses: 0 };
      }
      months[monthKey].contributions += c.amount;
    });
    
    // Process transactions
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, contributions: 0, income: 0, expenses: 0 };
      }
      
      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expenses += t.amount;
      }
    });
    
    return Object.values(months)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({
        ...m,
        netIncome: m.income - m.expenses,
        monthName: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));
  }, [contributions, transactions]);

  const expensesByCategory = useMemo(() => {
    const categories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({
        name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: amount
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const quarterlyTrends = useMemo(() => {
    const quarters = {};
    
    [...contributions, ...transactions].forEach(item => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `${year}-Q${quarter}`;
      
      if (!quarters[quarterKey]) {
        quarters[quarterKey] = { quarter: quarterKey, contributions: 0, income: 0, expenses: 0 };
      }
      
      if ('contribution_type' in item) {
        quarters[quarterKey].contributions += item.amount;
      } else if (item.type === 'income') {
        quarters[quarterKey].income += item.amount;
      } else {
        quarters[quarterKey].expenses += item.amount;
      }
    });
    
    return Object.values(quarters)
      .sort((a, b) => a.quarter.localeCompare(b.quarter))
      .map(q => ({
        ...q,
        netIncome: q.income - q.expenses
      }));
  }, [contributions, transactions]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-64 bg-slate-100 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Financial Trends & Analytics
          </CardTitle>
          <p className="text-slate-600">Visual analysis of financial performance over time</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="netIncome" stroke="#3b82f6" strokeWidth={2} name="Net Income" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quarterly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="contributions" fill="#8b5cf6" name="Contributions" />
                <Bar dataKey="netIncome" fill="#3b82f6" name="Net Income" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Total Contributions:</span>
                <span className="font-bold text-blue-600">
                  ${contributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Total Income:</span>
                <span className="font-bold text-green-600">
                  ${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Total Expenses:</span>
                <span className="font-bold text-red-600">
                  ${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium">Net ROI:</span>
                <span className="font-bold text-blue-600">
                  {(((transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                      transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) / 
                      contributions.reduce((sum, c) => sum + c.amount, 1)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}