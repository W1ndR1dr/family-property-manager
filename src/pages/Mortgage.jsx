
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Mortgage } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { AmortizationScheduleItem } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Calculator, DollarSign, Calendar, Percent } from "lucide-react";
import { differenceInDays } from 'date-fns';

import MortgageForm from "../components/mortgage/MortgageForm";
import PaymentScheduleTable from "../components/mortgage/PaymentScheduleTable";
import MortgageOverview from "../components/mortgage/MortgageOverview";

export default function MortgagePage() {
  const [mortgages, setMortgages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]); // New state for imported schedule items
  const [showMortgageForm, setShowMortgageForm] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [selectedMortgage, setSelectedMortgage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mortgagesData, transactionsData, scheduleData] = await Promise.all([
        Mortgage.list('-created_date'),
        Transaction.list('date'),
        AmortizationScheduleItem.list('payment_number') // Fetch all amortization schedule items
      ]);
      setMortgages(mortgagesData);
      setTransactions(transactionsData);
      setScheduleItems(scheduleData); // Set the fetched schedule items
      
      // console.log('Loaded data:', { 
      //   mortgages: mortgagesData.length, 
      //   transactions: transactionsData.length, 
      //   scheduleItems: scheduleData.length 
      // });
      
      if (mortgagesData.length > 0 && !selectedMortgage) {
        setSelectedMortgage(mortgagesData[0]);
      } else if (mortgagesData.length > 0 && selectedMortgage) {
        // Ensure selectedMortgage is still in the list after refresh, or select first
        const foundSelected = mortgagesData.find(m => m.id === selectedMortgage.id);
        if (!foundSelected) {
          setSelectedMortgage(mortgagesData[0]);
        }
      } else if (mortgagesData.length === 0) {
        setSelectedMortgage(null);
      }

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [selectedMortgage]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleMortgageSubmit = async (formData) => {
    try {
      if (editingMortgage) {
        await Mortgage.update(editingMortgage.id, formData);
      } else {
        await Mortgage.create(formData);
      }
      setShowMortgageForm(false);
      setEditingMortgage(null);
      await loadAllData(); // Ensure data is reloaded after submit
    } catch (error) {
      console.error("Error saving mortgage:", error);
    }
  };

  const handleEditMortgage = (mortgage) => {
    setEditingMortgage(mortgage);
    setShowMortgageForm(true);
  };

  const handleDeleteMortgage = async (mortgageToDelete) => {
    if (window.confirm(`Are you sure you want to delete the mortgage for "${mortgageToDelete.property_address}"?`)) {
      try {
        await Mortgage.delete(mortgageToDelete.id);
        // After deletion, re-select if the deleted mortgage was the selected one
        await loadAllData();
      } catch (error) {
        console.error("Error deleting mortgage:", error);
      }
    }
  };

  const amortizationSchedule = useMemo(() => {
    if (!selectedMortgage) return [];

    // Get schedule items for this specific mortgage
    const mortgageScheduleItems = scheduleItems.filter(item =>
      item.mortgage_id === selectedMortgage.id
    );

    // Get relevant mortgage transactions, filter by category and ensure date is after mortgage start date
    const mortgageTransactions = transactions.filter(t =>
      t.category === 'mortgage' &&
      new Date(t.date) >= new Date(selectedMortgage.start_date)
    );

    // This map will track which transactions have already been assigned to a payment
    const usedTransactionIds = new Set();

    return mortgageScheduleItems.map(item => {
      const dueDate = new Date(item.due_date);
      
      // Find transactions made up to 30 days before the due date that haven't been used yet
      // This allows for early payments made in the prior month to cover the current month's scheduled payment.
      const matchingTransactions = mortgageTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        const daysDiff = differenceInDays(dueDate, transactionDate); // Difference in days: dueDate - transactionDate
        return daysDiff >= 0 && daysDiff <= 30 && !usedTransactionIds.has(t.id);
      });

      // Sum the amounts of the found transactions
      const actualPayment = matchingTransactions.reduce((sum, t) => sum + t.amount, 0);

      let paidDate = null;
      if (actualPayment > 0) { // Only assign paidDate if an actual payment was found
        // Find the date of the most recent transaction in the matching group
        paidDate = matchingTransactions.reduce((latest, current) => 
            new Date(current.date) > new Date(latest.date) ? current : latest
        ).date;
        // Mark these transactions as used so they don't get matched again
        matchingTransactions.forEach(t => usedTransactionIds.add(t.id));
      }
      
      const variance = actualPayment > 0 ? actualPayment - item.scheduled_payment : 0;
      
      // Determine status based on actual payment and due date
      let status = '';
      if (actualPayment > 0) {
        if (Math.abs(variance) <= 0.01) { // Consider payment matched if variance is negligible
          status = '✅ Paid';
        } else {
          status = '⚠️ Variance'; // Paid, but amount differs from scheduled
        }
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison
        
        // Check if the due date has passed and no payment was found for the period
        if (dueDate < today) {
          status = '❌ Missed';
        } else {
          status = 'Pending';
        }
      }

      return {
        ...item, // Includes properties like payment_number, scheduled_payment, principal, interest, remaining_balance, due_date
        actual_payment: actualPayment,
        paid_date: paidDate, // Add the paid_date to the item
        variance: variance,
        status: status
      };
    });
  }, [selectedMortgage, scheduleItems, transactions]);

  // Calculations based on the combined amortization schedule
  const paidPayments = amortizationSchedule.filter(p => p.status === '✅ Paid').length;
  const totalInterestPaid = amortizationSchedule
    .filter(p => p.actual_payment > 0) // Only count interest for periods where a payment was made
    .reduce((sum, p) => sum + p.interest, 0); // Use 'interest' from the imported schedule item
  
  const currentBalance = amortizationSchedule.length > 0 
    ? amortizationSchedule[amortizationSchedule.length - 1].remaining_balance // Use 'remaining_balance' from the last schedule item
    : (selectedMortgage ? selectedMortgage.loan_amount : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Mortgage & Amortization</h1>
              <p className="text-slate-600">
                {scheduleItems.length > 0
                  ? `Showing imported schedule (${scheduleItems.length} payments) matched with actual transactions`
                  : "Import your lender's schedule or track payments manually"
                }
              </p>
            </div>
            <Button 
              onClick={() => { setShowMortgageForm(true); setEditingMortgage(null); }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {mortgages.length > 0 ? 'Add Another Mortgage' : 'Add First Mortgage'}
            </Button>
          </div>

          {showMortgageForm && (
            <div className="mb-8">
              <MortgageForm
                mortgage={editingMortgage}
                onSubmit={handleMortgageSubmit}
                onCancel={() => { setShowMortgageForm(false); setEditingMortgage(null); }}
              />
            </div>
          )}

          {mortgages.length === 0 && !isLoading ? (
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-12 text-center">
                <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Mortgages Added</h3>
                <p className="text-slate-600 mb-6">Add a mortgage to see its amortization schedule.</p>
              </CardContent>
            </Card>
          ) : selectedMortgage && (
            <>
              <div className="mb-8">
                <MortgageOverview 
                  mortgage={selectedMortgage}
                  paymentsMade={paidPayments}
                  totalPayments={scheduleItems.length}
                  onEdit={handleEditMortgage}
                  onDelete={handleDeleteMortgage}
                />
              </div>

              <Tabs defaultValue="schedule" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
                  <TabsTrigger value="summary">Payment Summary</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule">
                  <PaymentScheduleTable schedule={amortizationSchedule} />
                </TabsContent>
                
                <TabsContent value="summary">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border border-slate-200">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Payments Made</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                          {paidPayments} / {scheduleItems.length}
                        </div>
                        <p className="text-sm text-slate-600">
                          {scheduleItems.length > 0 ? 'From imported schedule' : 'Based on logged transactions'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200">
                      <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Total Interest Paid</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                          ${totalInterestPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        <p className="text-sm text-slate-600">Calculated from payments</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Percent className="w-5 h-5" />Current Balance</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                          ${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        <p className="text-sm text-slate-600">Remaining principal</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {mortgages.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Switch Mortgage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mortgages.filter(m => m.id !== selectedMortgage?.id).map(mortgage => (
                  <Card 
                    key={mortgage.id} 
                    className="bg-white border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMortgage(mortgage)}
                  >
                    <CardHeader><CardTitle className="text-base">{mortgage.property_address}</CardTitle></CardHeader>
                    <CardContent>
                       <Badge variant="outline">{mortgage.lender_name}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
