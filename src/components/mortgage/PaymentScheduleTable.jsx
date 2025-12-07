
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TrendingUp, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

export default function PaymentScheduleTable({ schedule }) {
  const getStatusIcon = (status) => {
    if (status === '✅ Paid') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === '⚠️ Variance') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    if (status === '❌ Missed') return <XCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getRowStyle = (status) => {
    if (status === '✅ Paid') return 'bg-green-50 text-green-900';
    if (status === '⚠️ Variance') return 'bg-amber-50 text-amber-900';
    if (status === '❌ Missed') return 'bg-red-50 text-red-900';
    return 'bg-slate-50 text-slate-600';
  };

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader>
        <CardTitle>Amortization Schedule</CardTitle>
        <p className="text-sm text-slate-600">
          {schedule.length > 0 
            ? `Imported lender schedule (${schedule.length} payments) matched with actual transactions`
            : "No schedule data available. Import your lender's CSV or add transactions manually."
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-96 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>#</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead> {/* New TableHead */}
                <TableHead>Scheduled Payment</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Actual Payment</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Remaining Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.length > 0 ? (
                schedule.map((payment) => (
                  <TableRow key={payment.id} className={getRowStyle(payment.status)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="text-xs">{payment.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{payment.payment_number}</TableCell>
                    <TableCell>{format(new Date(payment.due_date), 'MMM d, yyyy')}</TableCell>
                    {/* New TableCell for Paid Date */}
                    <TableCell className="text-slate-600">
                      {payment.paid_date ? format(new Date(payment.paid_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">${payment.scheduled_payment.toLocaleString()}</TableCell>
                    <TableCell className="text-blue-600">${payment.principal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-orange-600">${payment.interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="font-medium">
                      {payment.actual_payment ? `$${payment.actual_payment.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className={payment.variance > 0 ? 'text-green-600' : payment.variance < 0 ? 'text-red-600' : ''}>
                      {payment.variance !== 0 && payment.actual_payment ? `$${payment.variance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                    </TableCell>
                    <TableCell className="font-medium">${payment.remaining_balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center p-8 text-slate-500"> {/* Updated colSpan from 9 to 10 */}
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    No amortization schedule found.
                    <br />
                    Import your lender's CSV file on the Import page to see the schedule here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
