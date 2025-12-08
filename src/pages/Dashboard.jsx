
import React, { useState, useEffect } from "react";
import { Member, Contribution, Transaction, Mortgage, AmortizationScheduleItem, Property } from "@/api/entities";
import { DollarSign, TrendingUp, Users, Receipt, Home } from "lucide-react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { differenceInDays } from 'date-fns';

import MetricCard from "../components/dashboard/MetricCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import MortgageSnapshot from "../components/dashboard/MortgageSnapshot";
import FinancialHealth from "../components/dashboard/FinancialHealth";

export default function Dashboard() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mortgageData, setMortgageData] = useState({
    isLoading: true,
    lastPaid: null,
    nextPending: null,
    paymentsMade: 0,
    totalPayments: 0,
    progressPercent: 0,
    propertyAddress: null,
    currentBalance: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        membersData,
        contributionsData,
        transactionsData,
        mortgagesData,
        scheduleItemsData,
        propertiesData
      ] = await Promise.all([
        Member.list(),
        Contribution.list('-date'),
        Transaction.list('-date'),
        Mortgage.list('-created_date'),
        AmortizationScheduleItem.list('payment_number'),
        Property.list('-created_date')
      ]);
      setMembers(membersData);
      setContributions(contributionsData);
      setTransactions(transactionsData);

      // Set the first property as the active one
      if (propertiesData.length > 0) {
        setProperty(propertiesData[0]);
      }

      if (mortgagesData.length > 0 && scheduleItemsData.length > 0) {
        const mainMortgage = mortgagesData[0]; // Take the first mortgage as the main one
        const scheduleItemsForMortgage = scheduleItemsData.filter(item => item.mortgage_id === mainMortgage.id);
        const mortgageTransactions = transactionsData.filter(t => t.category === 'mortgage' && new Date(t.date) >= new Date(mainMortgage.start_date));

        const usedTransactionIds = new Set();
        const amortizationSchedule = scheduleItemsForMortgage.map(item => {
          const dueDate = new Date(item.due_date);
          const matchingTransactions = mortgageTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            // A transaction is considered a match if its date is on or within 30 days before the due date,
            // and it hasn't been used for another payment.
            const daysDiff = differenceInDays(dueDate, transactionDate); // Calculates dueDate - transactionDate
            return daysDiff >= 0 && daysDiff <= 30 && !usedTransactionIds.has(t.id);
          });
          const actualPayment = matchingTransactions.reduce((sum, t) => sum + t.amount, 0);
          
          let paidDate = null;
          if (matchingTransactions.length > 0) {
            // Find the latest date among the matching transactions for the paid date
            paidDate = matchingTransactions.reduce((latest, current) => 
                new Date(current.date) > new Date(latest.date) ? current : latest
            ).date;
            // Mark these transactions as used so they don't apply to other payments
            matchingTransactions.forEach(t => usedTransactionIds.add(t.id));
          }
          
          const variance = actualPayment > 0 ? actualPayment - item.scheduled_payment : 0;
          let status = '';
          if (actualPayment > 0) {
            // Check for near-exact payment, accounting for potential floating point inaccuracies
            status = Math.abs(variance) <= 0.01 ? '✅ Paid' : '⚠️ Variance';
          } else {
            // If no payment, check if it's past due
            status = new Date(item.due_date) < new Date() ? '❌ Missed' : 'Pending';
          }

          return { ...item, actual_payment: actualPayment, paid_date: paidDate, variance, status };
        });

        const paidPayments = amortizationSchedule.filter(p => p.status === '✅ Paid');
        const pendingPayments = amortizationSchedule.filter(p => p.status === 'Pending');

        // Calculate current balance from remaining payments
        const lastPaidPayment = amortizationSchedule.filter(p => p.status === '✅ Paid').sort((a, b) => b.payment_number - a.payment_number)[0];
        const currentBalance = lastPaidPayment?.remaining_balance || mainMortgage.loan_amount;

        setMortgageData({
          isLoading: false,
          lastPaid: paidPayments.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date))[0] || null,
          nextPending: pendingPayments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0] || null,
          paymentsMade: paidPayments.length,
          totalPayments: scheduleItemsForMortgage.length,
          progressPercent: scheduleItemsForMortgage.length > 0 ? (paidPayments.length / scheduleItemsForMortgage.length) * 100 : 0,
          propertyAddress: mainMortgage.property_address,
          currentBalance: currentBalance,
        });
      } else {
        // Handle cases where no mortgage or schedule data is available
        setMortgageData({ isLoading: false, lastPaid: null, nextPending: null, paymentsMade: 0, totalPayments: 0, progressPercent: 0, propertyAddress: null });
      }

    } catch (error) {
      console.error("Error loading data:", error);
      // Ensure mortgageData state is reset or set to a default error state on failure
      setMortgageData({ isLoading: false, lastPaid: null, nextPending: null, paymentsMade: 0, totalPayments: 0, progressPercent: 0, propertyAddress: null });
    }
    setIsLoading(false);
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Your family LLC property investment at a glance</p>
          </div>

          {/* Main Financial Health Dashboard */}
          <FinancialHealth
            transactions={transactions}
            contributions={contributions}
            members={members}
            mortgageData={mortgageData}
            property={property}
          />

          {/* Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <QuickActions />
            </div>

            <div className="lg:col-span-2">
              <RecentActivity
                contributions={contributions.slice(0, 5)}
                transactions={transactions.slice(0, 5)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
