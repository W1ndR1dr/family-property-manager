
import React, { useState, useEffect, useMemo } from "react";
import { Contribution, Transaction, Member, Mortgage, Distribution } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Calendar, DollarSign, Calculator } from "lucide-react";
import { format } from "date-fns";

import QuarterlyReport from "../components/reports/QuarterlyReport";
import MemberReport from "../components/reports/MemberReport";
import FinancialTrends from "../components/reports/FinancialTrends";
import ExportOptions from "../components/reports/ExportOptions";
import TaxReport from "../components/reports/TaxReport";

export default function Reports() {
  const [contributions, setContributions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [mortgages, setMortgages] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState('current');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        contributionsData,
        transactionsData,
        membersData,
        mortgagesData,
        distributionsData
      ] = await Promise.all([
        Contribution.list('-date'),
        Transaction.list('-date'),
        Member.list('name'),
        Mortgage.list('-created_date'),
        Distribution.list('-date')
      ]);

      setContributions(contributionsData);
      setTransactions(transactionsData);
      setMembers(membersData);
      setMortgages(mortgagesData);
      setDistributions(distributionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-Q${quarter}`;
  };

  const availableQuarters = useMemo(() => {
    const quarters = new Set([
      ...contributions.map(c => c.quarter).filter(Boolean),
      ...transactions.map(t => t.quarter).filter(Boolean)
    ]);
    return Array.from(quarters).sort().reverse();
  }, [contributions, transactions]);

  const availableYears = useMemo(() => {
    const years = new Set([
      ...contributions.map(c => c.year).filter(Boolean),
      ...transactions.map(t => t.year).filter(Boolean)
    ]);
    return Array.from(years).sort().reverse();
  }, [contributions, transactions]);

  const selectedQuarterData = useMemo(() => {
    const quarterToUse = selectedQuarter === 'current' ? getCurrentQuarter() : selectedQuarter;
    
    return {
      quarter: quarterToUse,
      contributions: contributions.filter(c => c.quarter === quarterToUse),
      transactions: transactions.filter(t => t.quarter === quarterToUse),
    };
  }, [selectedQuarter, contributions, transactions]);

  const yearlyData = useMemo(() => {
    return {
      contributions: contributions.filter(c => c.year === selectedYear),
      transactions: transactions.filter(t => t.year === selectedYear),
    };
  }, [selectedYear, contributions, transactions]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Reports</h1>
              <p className="text-slate-600">Generate and analyze quarterly and annual reports</p>
            </div>
            <ExportOptions 
              contributions={contributions}
              transactions={transactions}
              members={members}
              selectedQuarterData={selectedQuarterData}
              yearlyData={yearlyData}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Reporting Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Quarter</label>
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Quarter</SelectItem>
                      {availableQuarters.map(q => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Members:</span>
                    <span className="font-semibold">{members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Active Mortgages:</span>
                    <span className="font-semibold">{mortgages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Data Range:</span>
                    <span className="font-semibold text-xs">
                      {availableYears.length > 0 ? `${Math.min(...availableYears)} - ${Math.max(...availableYears)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  YTD Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Contributions:</span>
                    <span className="font-semibold text-green-600">
                      ${yearlyData.contributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Net Income:</span>
                    <span className="font-semibold">
                      ${(
                        yearlyData.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                        yearlyData.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="quarterly" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quarterly">Quarterly Report</TabsTrigger>
              <TabsTrigger value="tax">Tax Summary</TabsTrigger>
              <TabsTrigger value="members">Member Analysis</TabsTrigger>
              <TabsTrigger value="trends">Financial Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="quarterly">
              <QuarterlyReport
                data={selectedQuarterData}
                members={members}
                mortgages={mortgages}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="tax">
              <TaxReport
                transactions={transactions}
                contributions={contributions}
                members={members}
                distributions={distributions}
                selectedYear={selectedYear}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="members">
              <MemberReport
                members={members}
                contributions={contributions}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="trends">
              <FinancialTrends
                contributions={contributions}
                transactions={transactions}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
