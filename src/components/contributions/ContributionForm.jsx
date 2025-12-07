import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const CONTRIBUTION_TYPES = [
  "initial_investment",
  "additional_capital",
  "mortgage_payment",
  "expense_coverage",
  "other",
];

export default function ContributionForm({ contribution, members, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    member_name: "",
    amount: "",
    contribution_type: "",
    date: new Date(),
    description: ""
  });
  
  useEffect(() => {
    if (contribution) {
      setFormData({
        ...contribution,
        amount: contribution.amount.toString(),
        date: new Date(contribution.date),
      });
    } else {
        setFormData({
            member_name: "",
            amount: "",
            contribution_type: "",
            date: new Date(),
            description: ""
        });
    }
  }, [contribution]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const date = new Date(formData.date);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      quarter: `${year}-Q${quarter}`,
      year: year,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle>{contribution ? 'Edit Contribution' : 'Add New Contribution'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member">Member</Label>
              <Select
                value={formData.member_name}
                onValueChange={(value) => handleInputChange('member_name', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Contribution Type</Label>
              <Select
                value={formData.contribution_type}
                onValueChange={(value) => handleInputChange('contribution_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRIBUTION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
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
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add a note about this contribution..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {contribution ? 'Update' : 'Save'} Contribution
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}