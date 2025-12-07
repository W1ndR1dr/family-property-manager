import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, Calendar as CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { UploadFile } from "@/api/integrations";

const TRANSACTION_CATEGORIES = {
  income: ["rent", "other"],
  expense: ["mortgage", "insurance", "maintenance", "repairs", "utilities", "property_management", "legal_fees", "other"]
};

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    date: new Date(),
    description: "",
    vendor: "",
    receipt_url: ""
  });
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date),
      });
    } else {
      setFormData({
        type: "expense",
        category: "",
        amount: "",
        date: new Date(),
        description: "",
        vendor: "",
        receipt_url: ""
      });
    }
  }, [transaction]);

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

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: "" // Reset category when type changes
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('receipt_url', file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const availableCategories = TRANSACTION_CATEGORIES[formData.type] || [];

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
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
            
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor/Tenant</Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="Who is this transaction with?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt/Document</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload').click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Receipt'}
                </Button>
                {formData.receipt_url && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(formData.receipt_url, '_blank')}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add details about this transaction..."
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
              {transaction ? 'Update' : 'Save'} Transaction
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}