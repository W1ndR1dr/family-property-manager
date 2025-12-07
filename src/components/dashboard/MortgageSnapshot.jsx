import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import { Home, ArrowRight, CheckCircle, Calendar, Loader2 } from 'lucide-react';

export default function MortgageSnapshot({ data }) {
    if (data.isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Home className="w-5 h-5" />
                        Mortgage Snapshot
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-36">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </CardContent>
            </Card>
        );
    }
    
    if (!data.propertyAddress) {
        return (
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-slate-900"><Home className="w-5 h-5" />Mortgage Snapshot</CardTitle></CardHeader>
                <CardContent className="text-center text-slate-500 py-10">
                    <p>No mortgage data found.</p>
                    <Link to={createPageUrl("Mortgage")} className="text-blue-600 block mt-2 text-sm hover:underline">
                        Add a mortgage to see snapshot
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const { lastPaid, nextPending, paymentsMade, totalPayments, progressPercent, propertyAddress } = data;

    return (
        <Card className="bg-white border border-slate-200 w-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Home className="w-5 h-5 text-blue-600" />
                        Mortgage Snapshot: {propertyAddress}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">A quick look at your loan progress.</p>
                </div>
                <Link to={createPageUrl("Mortgage")} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                    View Details <ArrowRight className="w-4 h-4" />
                </Link>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Payment Progress</span>
                        <span className="text-sm text-slate-600 font-medium">{paymentsMade} of {totalPayments} payments</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Last Payment Made
                        </h4>
                        {lastPaid && lastPaid.actual_payment > 0 ? (
                            <div>
                                <p className="text-xl font-bold text-slate-900">${lastPaid.actual_payment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <p className="text-sm text-slate-600">Paid on {format(new Date(lastPaid.paid_date), 'MMM d, yyyy')}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 pt-4">No payments recorded yet.</p>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            Next Payment Due
                        </h4>
                        {nextPending ? (
                            <div>
                                <p className="text-xl font-bold text-slate-900">${nextPending.scheduled_payment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <p className="text-sm text-slate-600">Due on {format(new Date(nextPending.due_date), 'MMM d, yyyy')}</p>
                            </div>
                        ) : (
                             <p className="text-sm text-slate-500 pt-4">All payments made or no schedule found.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}