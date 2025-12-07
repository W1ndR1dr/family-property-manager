import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function MortgageForm({ mortgage, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    property_address: "",
    lender_name: "",
    loan_amount: "",
    interest_rate: "",
    term_years: "30",
    start_date: new Date(),
    monthly_payment: "",
    loan_number: "",
    notes: ""
  });

  useEffect(() => {
    if (mortgage) {
      setFormData({
        ...mortgage,
        loan_amount: mortgage.loan_amount.toString(),
        interest_rate: mortgage.interest_rate.toString(),
        term_years: mortgage.term_years.toString(),
        monthly_payment: mortgage.monthly_payment.toString(),
        start_date: new Date(mortgage.start_date),
      });
    }
  }, [mortgage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      term_years: parseInt(formData.term_years),
      monthly_payment: parseFloat(formData.monthly_payment),
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
        <CardTitle>{mortgage ? 'Edit Mortgage' : 'Add New Mortgage'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_address">Property Address</Label>
              <Input
                id="property_address"
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                placeholder="123 Main St, City, State"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lender_name">Lender Name</Label>
              <Input
                id="lender_name"
                value={formData.lender_name}
                onChange={(e) => handleInputChange('lender_name', e.target.value)}
                placeholder="First National Bank"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loan_amount">Loan Amount</Label>
              <Input
                id="loan_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.loan_amount}
                onChange={(e) => handleInputChange('loan_amount', e.target.value)}
                placeholder="500000"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                type="number"
                min="0"
                max="100"
                step="0.001"
                value={formData.interest_rate}
                onChange={(e) => handleInputChange('interest_rate', e.target.value)}
                placeholder="6.5"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="term_years">Term (Years)</Label>
              <Input
                id="term_years"
                type="number"
                min="1"
                max="50"
                value={formData.term_years}
                onChange={(e) => handleInputChange('term_years', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthly_payment">Monthly Payment</Label>
              <Input
                id="monthly_payment"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_payment}
                onChange={(e) => handleInputChange('monthly_payment', e.target.value)}
                placeholder="3200.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleInputChange('start_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loan_number">Loan Number</Label>
              <Input
                id="loan_number"
                value={formData.loan_number}
                onChange={(e) => handleInputChange('loan_number', e.target.value)}
                placeholder="Optional loan account number"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional information about this mortgage..."
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
              {mortgage ? 'Update' : 'Save'} Mortgage
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}