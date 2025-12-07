import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { format } from "date-fns";

// Schedule E category mapping for tax reports
const SCHEDULE_E_CATEGORIES = {
  rent: "Line 3 - Rents received",
  late_fees: "Line 3 - Rents received",
  pet_fees: "Line 3 - Rents received",
  parking: "Line 3 - Rents received",
  laundry: "Line 3 - Rents received",
  other_income: "Line 4 - Other income",
  advertising: "Line 5 - Advertising",
  auto_travel: "Line 6 - Auto and travel",
  cleaning_maintenance: "Line 7 - Cleaning and maintenance",
  commissions: "Line 8 - Commissions",
  insurance: "Line 9 - Insurance",
  legal_professional: "Line 10 - Legal and professional fees",
  management_fees: "Line 11 - Management fees",
  mortgage_interest: "Line 12 - Mortgage interest",
  other_interest: "Line 13 - Other interest",
  repairs: "Line 14 - Repairs",
  supplies: "Line 15 - Supplies",
  property_taxes: "Line 16 - Taxes",
  utilities: "Line 17 - Utilities",
  hoa_fees: "Line 19 - Other (HOA)",
  landscaping: "Line 19 - Other (Landscaping)",
  pest_control: "Line 19 - Other (Pest control)",
  other_expense: "Line 19 - Other",
  mortgage: "Line 12 - Mortgage interest",
  maintenance: "Line 7 - Cleaning and maintenance",
  property_management: "Line 11 - Management fees",
  legal_fees: "Line 10 - Legal and professional fees",
  other: "Line 19 - Other"
};

export default function ExportOptions({ 
  contributions, 
  transactions, 
  members, 
  selectedQuarterData, 
  yearlyData 
}) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (data, headers) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateQuarterlyReport = () => {
    const reportData = {
      quarter: selectedQuarterData.quarter,
      generatedDate: format(new Date(), 'PPP'),
      summary: {
        totalIncome: selectedQuarterData.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: selectedQuarterData.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        totalContributions: selectedQuarterData.contributions.reduce((sum, c) => sum + c.amount, 0),
        netIncome: selectedQuarterData.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
                  selectedQuarterData.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      },
      transactions: selectedQuarterData.transactions,
      contributions: selectedQuarterData.contributions
    };

    const content = `F Street Property Tracker - Quarterly Report
Quarter: ${reportData.quarter}
Generated: ${reportData.generatedDate}

FINANCIAL SUMMARY
Total Income: $${reportData.summary.totalIncome.toLocaleString()}
Total Expenses: $${reportData.summary.totalExpenses.toLocaleString()}
Net Income: $${reportData.summary.netIncome.toLocaleString()}
Member Contributions: $${reportData.summary.totalContributions.toLocaleString()}

TRANSACTIONS
${selectedQuarterData.transactions.map(t =>
  `${format(new Date(t.date), 'MM/dd/yyyy')} - ${t.type.toUpperCase()} - ${t.category.replace(/_/g, ' ')} - $${t.amount.toLocaleString()} - ${t.description}`
).join('\n')}

CONTRIBUTIONS
${selectedQuarterData.contributions.map(c =>
  `${format(new Date(c.date), 'MM/dd/yyyy')} - ${c.member_name} - ${c.contribution_type.replace(/_/g, ' ')} - $${c.amount.toLocaleString()} - ${c.description}`
).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quarterly_report_${selectedQuarterData.quarter}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllData = async () => {
    setIsExporting(true);
    
    try {
      // Export contributions
      const contributionsCSV = generateCSV(
        contributions.map(c => ({
          date: format(new Date(c.date), 'yyyy-MM-dd'),
          member_name: c.member_name,
          amount: c.amount,
          contribution_type: c.contribution_type,
          description: c.description,
          quarter: c.quarter
        })),
        ['date', 'member_name', 'amount', 'contribution_type', 'description', 'quarter']
      );
      downloadCSV(contributionsCSV, 'contributions.csv');

      // Export transactions
      const transactionsCSV = generateCSV(
        transactions.map(t => ({
          date: format(new Date(t.date), 'yyyy-MM-dd'),
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description,
          vendor: t.vendor || '',
          quarter: t.quarter
        })),
        ['date', 'type', 'category', 'amount', 'description', 'vendor', 'quarter']
      );
      downloadCSV(transactionsCSV, 'transactions.csv');

      // Export members
      const membersCSV = generateCSV(
        members.map(m => ({
          name: m.name,
          role: m.role,
          ownership_percentage: m.ownership_percentage,
          email: m.email || '',
          phone: m.phone || ''
        })),
        ['name', 'role', 'ownership_percentage', 'email', 'phone']
      );
      downloadCSV(membersCSV, 'members.csv');
      
    } catch (error) {
      console.error('Export error:', error);
    }
    
    setIsExporting(false);
  };

  // Generate printable PDF (opens print dialog)
  const generatePrintableReport = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

    // Group expenses by Schedule E category
    const expensesByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const scheduleECategory = SCHEDULE_E_CATEGORIES[t.category] || 'Line 19 - Other';
      if (!expensesByCategory[scheduleECategory]) {
        expensesByCategory[scheduleECategory] = 0;
      }
      expensesByCategory[scheduleECategory] += t.amount;
    });

    // Group income by Schedule E category
    const incomeByCategory = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      const scheduleECategory = SCHEDULE_E_CATEGORIES[t.category] || 'Line 3 - Rents received';
      if (!incomeByCategory[scheduleECategory]) {
        incomeByCategory[scheduleECategory] = 0;
      }
      incomeByCategory[scheduleECategory] += t.amount;
    });

    // Contributions by member
    const contributionsByMember = {};
    contributions.forEach(c => {
      if (!contributionsByMember[c.member_name]) {
        contributionsByMember[c.member_name] = 0;
      }
      contributionsByMember[c.member_name] += c.amount;
    });

    // Member allocations
    const memberAllocations = members.map(m => ({
      name: m.name,
      ownership: m.ownership_percentage || 0,
      allocated: (netIncome * (m.ownership_percentage || 0)) / 100
    }));

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>F Street Property Tracker - Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: #f8fafc; font-weight: 600; }
          .amount { text-align: right; font-family: monospace; }
          .total-row { background-color: #f1f5f9; font-weight: 600; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { background: #f8fafc; padding: 15px; border-radius: 8px; }
          .summary-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; }
          .summary-card .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>F Street Property Tracker</h1>
        <p>Financial Report - Generated ${format(new Date(), 'MMMM d, yyyy')}</p>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Income</div>
            <div class="value income">$${totalIncome.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Expenses</div>
            <div class="value expense">$${totalExpenses.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="label">Net Income</div>
            <div class="value" style="color: ${netIncome >= 0 ? '#16a34a' : '#dc2626'}">$${netIncome.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Contributions</div>
            <div class="value" style="color: #2563eb">$${totalContributions.toLocaleString()}</div>
          </div>
        </div>

        <h2>Schedule E - Income</h2>
        <table>
          <thead>
            <tr><th>Category</th><th class="amount">Amount</th></tr>
          </thead>
          <tbody>
            ${Object.entries(incomeByCategory).sort().map(([cat, amt]) => `
              <tr><td>${cat}</td><td class="amount income">$${amt.toLocaleString()}</td></tr>
            `).join('')}
            <tr class="total-row"><td>Total Income</td><td class="amount income">$${totalIncome.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <h2>Schedule E - Expenses</h2>
        <table>
          <thead>
            <tr><th>Category</th><th class="amount">Amount</th></tr>
          </thead>
          <tbody>
            ${Object.entries(expensesByCategory).sort().map(([cat, amt]) => `
              <tr><td>${cat}</td><td class="amount">$${amt.toLocaleString()}</td></tr>
            `).join('')}
            <tr class="total-row"><td>Total Expenses</td><td class="amount expense">$${totalExpenses.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <h2>K-1 Allocation by Member</h2>
        <table>
          <thead>
            <tr><th>Member</th><th class="amount">Ownership %</th><th class="amount">Allocated Income</th></tr>
          </thead>
          <tbody>
            ${memberAllocations.map(m => `
              <tr>
                <td>${m.name}</td>
                <td class="amount">${m.ownership}%</td>
                <td class="amount" style="color: ${m.allocated >= 0 ? '#16a34a' : '#dc2626'}">$${m.allocated.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Member Contributions</h2>
        <table>
          <thead>
            <tr><th>Member</th><th class="amount">Total Contributed</th></tr>
          </thead>
          <tbody>
            ${Object.entries(contributionsByMember).map(([name, amt]) => `
              <tr><td>${name}</td><td class="amount">$${amt.toLocaleString()}</td></tr>
            `).join('')}
            <tr class="total-row"><td>Total</td><td class="amount">$${totalContributions.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This report is for informational purposes only. Consult with a qualified tax professional for official tax preparation.</p>
          <p>Generated by F Street Property Tracker on ${format(new Date(), 'PPpp')}</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={generatePrintableReport}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save as PDF
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={generateQuarterlyReport}
              disabled={isExporting}
            >
              <FileText className="w-4 h-4 mr-2" />
              Quarterly Report (TXT)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={exportAllData}
              disabled={isExporting}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              All Data (CSV Files)
            </Button>

            <div className="pt-2 text-xs text-slate-500">
              Use "Print / Save as PDF" to generate a formatted report. Select "Save as PDF" in the print dialog.
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}