import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function PaymentForm({ mortgage, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    payment_number: "",
    payment_date: new Date(),
    principal_payment: "",
    interest_payment: "",
    total_payment: mortgage.monthly_payment.toString(),
    remaining_balance: "",
    is_paid: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      payment_number: parseInt(formData.payment_number),
      principal_payment: parseFloat(formData.principal_payment),
      interest_payment: parseFloat(formData.interest_payment),
      total_payment: parseFloat(formData.total_payment),
      remaining_balance: parseFloat(formData.remaining_balance),
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
        <CardTitle>Add Payment Schedule Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_number">Payment Number</Label>
              <Input
                id="payment_number"
                type="number"
                min="1"
                value={formData.payment_number}
                onChange={(e) => handleInputChange('payment_number', e.target.value)}
                placeholder="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.payment_date ? format(formData.payment_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.payment_date}
                    onSelect={(date) => handleInputChange('payment_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="principal_payment">Principal Payment</Label>
              <Input
                id="principal_payment"
                type="number"
                min="0"
                step="0.01"
                value={formData.principal_payment}
                onChange={(e) => handleInputChange('principal_payment', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest_payment">Interest Payment</Label>
              <Input
                id="interest_payment"
                type="number"
                min="0"
                step="0.01"
                value={formData.interest_payment}
                onChange={(e) => handleInputChange('interest_payment', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total_payment">Total Payment</Label>
              <Input
                id="total_payment"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_payment}
                onChange={(e) => handleInputChange('total_payment', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remaining_balance">Remaining Balance</Label>
              <Input
                id="remaining_balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.remaining_balance}
                onChange={(e) => handleInputChange('remaining_balance', e.target.value)}
                placeholder="0.00"
                required
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
              Save Payment Entry
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}