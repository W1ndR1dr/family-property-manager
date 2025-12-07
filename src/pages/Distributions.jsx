import React, { useState, useEffect, useMemo } from "react";
import { Distribution, Member, Transaction, Contribution } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PiggyBank,
  Calculator,
  DollarSign,
  Calendar as CalendarIcon,
  Save,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Percent,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const DISTRIBUTION_METHODS = [
  { value: "check", label: "Check" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "reinvested", label: "Reinvested" },
  { value: "other", label: "Other" },
];

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    member_id: "",
    member_name: "",
    amount: "",
    date: new Date(),
    period: "",
    method: "transfer",
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [distData, membersData, transData, contribData] = await Promise.all([
        Distribution.list('-date'),
        Member.list('name'),
        Transaction.list('-date'),
        Contribution.list('-date')
      ]);
      setDistributions(distData);
      setMembers(membersData);
      setTransactions(transData);
      setContributions(contribData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const yearTransactions = transactions.filter(t => t.year === selectedYear);
    const yearContributions = contributions.filter(c => c.year === selectedYear);
    const yearDistributions = distributions.filter(d => {
      const date = new Date(d.date);
      return date.getFullYear() === selectedYear;
    });

    const totalIncome = yearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    const totalContributions = yearContributions.reduce((sum, c) => sum + c.amount, 0);

    const totalDistributed = yearDistributions.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      totalContributions,
      totalDistributed,
      availableForDistribution: netIncome - totalDistributed
    };
  }, [transactions, contributions, distributions, selectedYear]);

  // Calculate member allocations
  const memberAllocations = useMemo(() => {
    return members.map(member => {
      const ownership = member.ownership_percentage || 0;
      const allocatedShare = (financialSummary.netIncome * ownership) / 100;

      // Total contributions by this member
      const memberContributions = contributions
        .filter(c => c.member_name === member.name)
        .reduce((sum, c) => sum + c.amount, 0);

      // Total distributions to this member
      const memberDistributions = distributions
        .filter(d => d.member_name === member.name || d.member_id === member.id)
        .reduce((sum, d) => sum + d.amount, 0);

      // Year-specific distributions
      const yearDistributions = distributions
        .filter(d => {
          const date = new Date(d.date);
          return (d.member_name === member.name || d.member_id === member.id) &&
                 date.getFullYear() === selectedYear;
        })
        .reduce((sum, d) => sum + d.amount, 0);

      const yearAllocatedShare = (financialSummary.netIncome * ownership) / 100;
      const owedThisYear = yearAllocatedShare - yearDistributions;

      return {
        ...member,
        allocatedShare: yearAllocatedShare,
        totalContributions: memberContributions,
        totalDistributions: memberDistributions,
        yearDistributions,
        owedThisYear,
        capitalAccount: memberContributions + allocatedShare - memberDistributions
      };
    });
  }, [members, contributions, distributions, financialSummary, selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set([
      ...transactions.map(t => t.year).filter(Boolean),
      ...contributions.map(c => c.year).filter(Boolean),
      new Date().getFullYear()
    ]);
    return Array.from(years).sort().reverse();
  }, [transactions, contributions]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberSelect = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        member_id: memberId,
        member_name: member.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const date = new Date(formData.date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      await Distribution.create({
        ...formData,
        amount: parseFloat(formData.amount),
        period: formData.period || `${date.getFullYear()}-Q${quarter}`,
        year: date.getFullYear()
      });

      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving distribution:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: "",
      member_name: "",
      amount: "",
      date: new Date(),
      period: "",
      method: "transfer",
      description: ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this distribution?")) {
      try {
        await Distribution.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting distribution:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Distributions</h1>
              <p className="text-slate-600">Track profit distributions to LLC members by ownership percentage</p>
            </div>
            <div className="flex gap-4">
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Distribution
              </Button>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Net Income ({selectedYear})</p>
                    <p className={`text-2xl font-bold ${financialSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${financialSummary.netIncome.toLocaleString()}
                    </p>
                  </div>
                  {financialSummary.netIncome >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Distributed</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${financialSummary.totalDistributed.toLocaleString()}
                    </p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Available to Distribute</p>
                    <p className={`text-2xl font-bold ${financialSummary.availableForDistribution >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      ${financialSummary.availableForDistribution.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">LLC Members</p>
                    <p className="text-2xl font-bold text-slate-900">{members.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Record Distribution</CardTitle>
                <CardDescription>Record a profit distribution to an LLC member</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Member</Label>
                      <Select
                        value={formData.member_id}
                        onValueChange={handleMemberSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.ownership_percentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          className="pl-9"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => handleInputChange('date', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Input
                        value={formData.period}
                        onChange={(e) => handleInputChange('period', e.target.value)}
                        placeholder="e.g., 2024-Q4"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={formData.method}
                        onValueChange={(v) => handleInputChange('method', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRIBUTION_METHODS.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Optional note"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Record Distribution
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Member Allocation Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Member Allocations ({selectedYear})
              </CardTitle>
              <CardDescription>
                Profit allocation based on ownership percentage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No members added yet. Add members first to see allocations.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Ownership</TableHead>
                      <TableHead className="text-right">Allocated Share</TableHead>
                      <TableHead className="text-right">Distributed</TableHead>
                      <TableHead className="text-right">Balance Owed</TableHead>
                      <TableHead className="text-right">Capital Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberAllocations.map(member => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            <Percent className="w-3 h-3 mr-1" />
                            {member.ownership_percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${member.allocatedShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          ${member.yearDistributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={member.owedThisYear > 0 ? 'text-green-600 font-medium' : 'text-slate-600'}>
                            ${member.owedThisYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${member.capitalAccount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50 font-medium">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0)}%
                      </TableCell>
                      <TableCell className="text-right">
                        ${financialSummary.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${financialSummary.totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${financialSummary.availableForDistribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">—</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}

              {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0) !== 100 && members.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Warning: Total ownership is {members.reduce((sum, m) => sum + (m.ownership_percentage || 0), 0)}%, not 100%.
                    Update member ownership percentages.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution History */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>Record of all profit distributions</CardDescription>
            </CardHeader>
            <CardContent>
              {distributions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <PiggyBank className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No distributions recorded yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map(dist => (
                      <TableRow key={dist.id}>
                        <TableCell>{format(new Date(dist.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{dist.member_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{dist.period || '—'}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{dist.method?.replace('_', ' ')}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${dist.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{dist.description || '—'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(dist.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
