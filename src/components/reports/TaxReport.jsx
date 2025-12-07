import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, DollarSign, Users, Calculator, AlertCircle } from "lucide-react";

// Schedule E line item mapping
const SCHEDULE_E_CATEGORIES = {
  // Income (Lines 3-4)
  rent: { line: "3", name: "Rents received" },
  late_fees: { line: "3", name: "Rents received" },
  pet_fees: { line: "3", name: "Rents received" },
  parking: { line: "3", name: "Rents received" },
  laundry: { line: "3", name: "Rents received" },
  other_income: { line: "4", name: "Royalties received" },

  // Expenses (Lines 5-19)
  advertising: { line: "5", name: "Advertising" },
  auto_travel: { line: "6", name: "Auto and travel" },
  cleaning_maintenance: { line: "7", name: "Cleaning and maintenance" },
  commissions: { line: "8", name: "Commissions" },
  insurance: { line: "9", name: "Insurance" },
  legal_professional: { line: "10", name: "Legal and other professional fees" },
  management_fees: { line: "11", name: "Management fees" },
  mortgage_interest: { line: "12", name: "Mortgage interest paid to banks, etc." },
  other_interest: { line: "13", name: "Other interest" },
  repairs: { line: "14", name: "Repairs" },
  supplies: { line: "15", name: "Supplies" },
  property_taxes: { line: "16", name: "Taxes" },
  utilities: { line: "17", name: "Utilities" },
  hoa_fees: { line: "19", name: "Other (HOA fees)" },
  landscaping: { line: "19", name: "Other (Landscaping)" },
  pest_control: { line: "19", name: "Other (Pest control)" },
  other_expense: { line: "19", name: "Other" },

  // Legacy categories mapping
  mortgage: { line: "12", name: "Mortgage interest paid to banks, etc." },
  maintenance: { line: "7", name: "Cleaning and maintenance" },
  property_management: { line: "11", name: "Management fees" },
  legal_fees: { line: "10", name: "Legal and other professional fees" },
  other: { line: "19", name: "Other" }
};

export default function TaxReport({ transactions, contributions, members, distributions, selectedYear, isLoading }) {
  // Filter data for selected year
  const yearTransactions = useMemo(() =>
    transactions.filter(t => t.year === selectedYear),
    [transactions, selectedYear]
  );

  const yearContributions = useMemo(() =>
    contributions.filter(c => c.year === selectedYear),
    [contributions, selectedYear]
  );

  const yearDistributions = useMemo(() =>
    distributions?.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === selectedYear;
    }) || [],
    [distributions, selectedYear]
  );

  // Calculate Schedule E summary
  const scheduleESummary = useMemo(() => {
    const summary = {
      income: {},
      expenses: {},
      totalIncome: 0,
      totalExpenses: 0
    };

    yearTransactions.forEach(t => {
      const categoryInfo = SCHEDULE_E_CATEGORIES[t.category] || { line: "19", name: "Other" };

      if (t.type === 'income') {
        const key = categoryInfo.line;
        if (!summary.income[key]) {
          summary.income[key] = { line: key, name: categoryInfo.name, amount: 0 };
        }
        summary.income[key].amount += t.amount;
        summary.totalIncome += t.amount;
      } else {
        const key = `${categoryInfo.line}-${categoryInfo.name}`;
        if (!summary.expenses[key]) {
          summary.expenses[key] = { line: categoryInfo.line, name: categoryInfo.name, amount: 0 };
        }
        summary.expenses[key].amount += t.amount;
        summary.totalExpenses += t.amount;
      }
    });

    return summary;
  }, [yearTransactions]);

  // Calculate member allocations for K-1
  const memberAllocations = useMemo(() => {
    const netIncome = scheduleESummary.totalIncome - scheduleESummary.totalExpenses;

    return members.map(member => {
      const ownership = member.ownership_percentage || 0;
      const allocatedIncome = (netIncome * ownership) / 100;

      const memberContributions = yearContributions
        .filter(c => c.member_name === member.name)
        .reduce((sum, c) => sum + c.amount, 0);

      const memberDistributions = yearDistributions
        .filter(d => d.member_name === member.name || d.member_id === member.id)
        .reduce((sum, d) => sum + d.amount, 0);

      // Capital account calculation
      // Beginning capital + contributions + allocated income - distributions = ending capital
      const capitalChange = memberContributions + allocatedIncome - memberDistributions;

      return {
        name: member.name,
        ownership,
        allocatedIncome,
        contributions: memberContributions,
        distributions: memberDistributions,
        capitalChange
      };
    });
  }, [members, scheduleESummary, yearContributions, yearDistributions]);

  const netIncome = scheduleESummary.totalIncome - scheduleESummary.totalExpenses;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-slate-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Tax Summary Report - {selectedYear}
          </CardTitle>
          <CardDescription>
            Schedule E breakdown and K-1 allocation worksheet for LLC members
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Gross Income</div>
            <div className="text-2xl font-bold text-green-600">
              ${scheduleESummary.totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600">
              ${scheduleESummary.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Net Income (Loss)</div>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-600">Total Distributions</div>
            <div className="text-2xl font-bold text-blue-600">
              ${yearDistributions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule E Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              Schedule E - Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(scheduleESummary.income)
                  .sort((a, b) => a.line.localeCompare(b.line))
                  .map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="outline">{item.line}</Badge>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                {Object.keys(scheduleESummary.income).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                      No income recorded for {selectedYear}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-green-50 font-medium">
                  <TableCell></TableCell>
                  <TableCell>Total Income</TableCell>
                  <TableCell className="text-right text-green-600">
                    ${scheduleESummary.totalIncome.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
              Schedule E - Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(scheduleESummary.expenses)
                  .sort((a, b) => a.line.localeCompare(b.line))
                  .map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="outline">{item.line}</Badge>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                {Object.keys(scheduleESummary.expenses).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                      No expenses recorded for {selectedYear}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-red-50 font-medium">
                  <TableCell></TableCell>
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right text-red-600">
                    ${scheduleESummary.totalExpenses.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* K-1 Allocation Worksheet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            K-1 Allocation Worksheet
          </CardTitle>
          <CardDescription>
            Income allocation by ownership percentage for Schedule K-1 preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Add LLC members to see K-1 allocations</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Ownership %</TableHead>
                    <TableHead className="text-right">Allocated Income</TableHead>
                    <TableHead className="text-right">Contributions</TableHead>
                    <TableHead className="text-right">Distributions</TableHead>
                    <TableHead className="text-right">Capital Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberAllocations.map((member, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="text-right">{member.ownership}%</TableCell>
                      <TableCell className={`text-right font-medium ${member.allocatedIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${member.allocatedIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${member.contributions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ${member.distributions.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${member.capitalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${member.capitalChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0)}%
                    </TableCell>
                    <TableCell className={`text-right ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netIncome.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${yearContributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${yearDistributions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0) !== 100 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Warning: Total ownership is {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0)}%, not 100%.
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Tax Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Tax Disclaimer</p>
              <p>
                This report is for informational purposes only. Consult with a qualified tax professional
                for official tax preparation. Schedule K-1 forms should be prepared by your CPA based on
                the LLC's complete financial records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
