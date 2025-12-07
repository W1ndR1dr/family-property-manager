import React, { useState, useEffect, useMemo } from "react";
import { Contribution, Member } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, DollarSign, Percent } from "lucide-react";
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

import ContributionForm from "../components/contributions/ContributionForm";
import MetricCard from "../components/dashboard/MetricCard";

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContribution, setEditingContribution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ member: 'all', quarter: 'all' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contributionsData, membersData] = await Promise.all([
        Contribution.list('-date'),
        Member.list('name')
      ]);
      setContributions(contributionsData);
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingContribution) {
        await Contribution.update(editingContribution.id, formData);
      } else {
        await Contribution.create(formData);
      }
      setShowForm(false);
      setEditingContribution(null);
      loadData();
    } catch (error) {
      console.error("Error saving contribution:", error);
    }
  };

  const handleEdit = (contribution) => {
    setEditingContribution(contribution);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contribution?")) {
      try {
        await Contribution.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting contribution:", error);
      }
    }
  };

  const quarters = useMemo(() => {
    const q = new Set(contributions.map(c => c.quarter).filter(Boolean));
    return Array.from(q).sort().reverse();
  }, [contributions]);

  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      const memberMatch = filters.member === 'all' || c.member_name === filters.member;
      const quarterMatch = filters.quarter === 'all' || c.quarter === filters.quarter;
      return memberMatch && quarterMatch;
    });
  }, [contributions, filters]);

  const totalContributions = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
  const avgContribution = filteredContributions.length > 0 ? totalContributions / filteredContributions.length : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Member Contributions</h1>
              <p className="text-slate-600">Track all capital inputs from LLC members</p>
            </div>
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingContribution(null); }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contribution
            </Button>
          </div>

          {showForm && (
            <div className="mb-8">
              <ContributionForm
                contribution={editingContribution}
                members={members}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingContribution(null); }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Total Contributions" value={`$${totalContributions.toLocaleString()}`} icon={BarChart} color="blue" />
            <MetricCard title="Average Contribution" value={`$${avgContribution.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="green" />
            <MetricCard title="Contributions Shown" value={filteredContributions.length} icon={Percent} color="purple" />
          </div>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Contribution History</CardTitle>
              <div className="flex gap-4">
                <Select value={filters.member} onValueChange={(value) => setFilters(f => ({ ...f, member: value }))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.quarter} onValueChange={(value) => setFilters(f => ({ ...f, quarter: value }))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quarters</SelectItem>
                    {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={6} className="text-center p-4"><div className="animate-pulse h-6 bg-slate-100 rounded"></div></TableCell></TableRow>
                    ))
                  ) : filteredContributions.length > 0 ? (
                    filteredContributions.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.member_name}</TableCell>
                        <TableCell>${c.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{c.contribution_type.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>{format(new Date(c.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="max-w-xs truncate">{c.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(c.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center p-8 text-slate-500">No contributions found for the selected filters.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}