import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";

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
              CSV files can be imported into Excel or other spreadsheet applications.
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}