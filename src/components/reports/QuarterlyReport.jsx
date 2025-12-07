
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Added this import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Users, Home } from "lucide-react";
import { format } from "date-fns";

export default function QuarterlyReport({ data, members, isLoading }) { // Removed 'mortgages' prop
  const totalContributions = data.contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  // Changed totalMortgagePayments to filter from transactions
  const totalMortgagePayments = data.transactions.filter(t => t.category === 'mortgage' && t.type === 'expense').reduce((sum, p) => sum + p.amount, 0);

  const expensesByCategory = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const contributionsByMember = data.contributions.reduce((acc, c) => {
    acc[c.member_name] = (acc[c.member_name] || 0) + c.amount;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-8 bg-slate-100 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">
            Quarterly Report - {data.quarter}
          </CardTitle>
          <p className="text-slate-600">Financial performance summary for the quarter</p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Total Income</p>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Total Expenses</p>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Net Income</p>
              <DollarSign className={`w-4 h-4 ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Contributions</p>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalContributions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(expensesByCategory).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(expensesByCategory)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell>
                          <Badge variant="outline">
                            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {((amount / totalExpenses) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-slate-500 text-center py-8">No expenses recorded for this quarter</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle>Member Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(contributionsByMember).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(contributionsByMember)
                    .sort(([,a], [,b]) => b - a)
                    .map(([member, amount]) => (
                      <TableRow key={member}>
                        <TableCell className="font-medium">{member}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {((amount / totalContributions) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-slate-500 text-center py-8">No contributions recorded for this quarter</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
