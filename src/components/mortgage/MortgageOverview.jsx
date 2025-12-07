
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Home, Building, DollarSign, Calendar, Percent, Trash2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MortgageOverview({ mortgage, paymentsMade, totalPayments, onEdit, onDelete }) {
  const progressPercent = totalPayments > 0 ? (paymentsMade / totalPayments) * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2 text-slate-900">
              <Home className="w-6 h-6" />
              {mortgage.property_address}
            </CardTitle>
            <p className="text-slate-600 mt-1">Mortgage Details & Overview</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(mortgage)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(mortgage)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Mortgage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building className="w-4 h-4" />
              Lender
            </div>
            <p className="font-semibold text-slate-900">{mortgage.lender_name}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4" />
              Original Loan Amount
            </div>
            <p className="font-semibold text-slate-900">${mortgage.loan_amount.toLocaleString()}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Percent className="w-4 h-4" />
              Interest Rate
            </div>
            <p className="font-semibold text-slate-900">{mortgage.interest_rate}% APR</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              Term & Start Date
            </div>
            <p className="font-semibold text-slate-900">{mortgage.term_years} years</p>
             <p className="text-sm text-slate-600">Started: {format(new Date(mortgage.start_date), 'MMM d, yyyy')}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Payment Progress</span>
            <span className="text-sm text-slate-600">
              {paymentsMade} of {totalPayments || 'calculated'} payments
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
