
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Info, Copy } from 'lucide-react';
import { AmortizationScheduleItem } from '@/api/entities';
import { Mortgage } from '@/api/entities';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImportPage() {
    const [file, setFile] = useState(null);
    const [csvText, setCsvText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setStatus({ message: '', type: '' });
            
            // Read the file as text
            const reader = new FileReader();
            reader.onload = (event) => {
                setCsvText(event.target.result);
            };
            reader.readAsText(selectedFile);
        } else {
            setFile(null);
            setStatus({ message: 'Please select a valid .csv file.', type: 'error' });
        }
    };

    const parseCsvData = (csvContent) => {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Find column indices for all 9 expected columns
        const paymentNumIndex = headers.findIndex(h => h.toLowerCase().includes('payment') && h.toLowerCase().includes('#'));
        const dueDateIndex = headers.findIndex(h => h.toLowerCase().includes('due') && h.toLowerCase().includes('date'));
        const scheduledPaymentIndex = headers.findIndex(h => h.toLowerCase().includes('scheduled') && h.toLowerCase().includes('payment'));
        const interestIndex = headers.findIndex(h => h.toLowerCase() === 'interest');
        const principalIndex = headers.findIndex(h => h.toLowerCase() === 'principal');
        const remainingBalanceIndex = headers.findIndex(h => h.toLowerCase().includes('remaining') && h.toLowerCase().includes('balance'));
        const actualPaymentIndex = headers.findIndex(h => h.toLowerCase().includes('actual') && h.toLowerCase().includes('payment'));
        const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');
        const varianceIndex = headers.findIndex(h => h.toLowerCase() === 'variance');

        if (dueDateIndex === -1 || scheduledPaymentIndex === -1) {
            throw new Error('Could not find required columns "Due Date" and "Scheduled Payment" in CSV');
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            
            if (values.length < Math.max(paymentNumIndex, dueDateIndex, scheduledPaymentIndex) + 1) continue; // Skip incomplete rows
            
            const paymentNumber = paymentNumIndex >= 0 ? parseInt(values[paymentNumIndex]) : i;
            const dueDateStr = values[dueDateIndex];
            const scheduledPayment = parseFloat(values[scheduledPaymentIndex]);
            
            if (!dueDateStr || isNaN(scheduledPayment)) continue; // Skip invalid rows

            // Parse date (handle M/D/YY and M/D/YYYY)
            let dueDate;
            try {
                const parts = dueDateStr.split('/');
                if (parts.length === 3) {
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000; // Convert YY to YYYY
                    dueDate = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
                } else {
                    dueDate = new Date(dueDateStr);
                }
            } catch {
                continue; // Skip rows with invalid dates
            }

            // Parse optional fields (may be blank)
            const actualPaymentValue = actualPaymentIndex >= 0 && values[actualPaymentIndex] ? parseFloat(values[actualPaymentIndex]) : null;
            const statusValue = statusIndex >= 0 && values[statusIndex] ? values[statusIndex] : null;
            const varianceValue = varianceIndex >= 0 && values[varianceIndex] ? parseFloat(values[varianceIndex]) : null;

            data.push({
                payment_number: paymentNumber,
                due_date: dueDate.toISOString().split('T')[0],
                period_key: format(dueDate, 'yyyy-MM'),
                scheduled_payment: scheduledPayment,
                interest: interestIndex >= 0 ? parseFloat(values[interestIndex]) || 0 : 0,
                principal: principalIndex >= 0 ? parseFloat(values[principalIndex]) || 0 : 0,
                remaining_balance: remainingBalanceIndex >= 0 ? parseFloat(values[remainingBalanceIndex]) || 0 : 0,
                actual_payment: actualPaymentValue,
                status: statusValue,
                variance: varianceValue
            });
        }

        return data;
    };

    const handleImportFromText = async () => {
        if (!csvText.trim()) {
            setStatus({ message: 'Please paste or upload CSV data first.', type: 'error' });
            return;
        }

        setIsProcessing(true);
        setStatus({ message: 'Processing CSV data...', type: 'info' });

        try {
            const mortgages = await Mortgage.list();
            if (mortgages.length === 0) {
                throw new Error("No mortgage found. Please add a mortgage on the Mortgage & Amortization page first.");
            }
            
            const primaryMortgageId = mortgages[0].id;
            
            // Clear existing items for this mortgage
            setStatus({ message: 'Clearing existing schedule...', type: 'info' });
            const existingItems = await AmortizationScheduleItem.filter({ mortgage_id: primaryMortgageId });
            for (const item of existingItems) {
                await AmortizationScheduleItem.delete(item.id);
            }

            // Parse CSV
            const parsedData = parseCsvData(csvText);
            
            if (parsedData.length === 0) {
                throw new Error('No valid payment data found in CSV. Check format and try again.');
            }

            setStatus({ message: `Found ${parsedData.length} payments. Saving to database...`, type: 'info' });

            // Add mortgage_id to each item
            const itemsToCreate = parsedData.map(item => ({
                ...item,
                mortgage_id: primaryMortgageId
            }));

            // Bulk create all items
            await AmortizationScheduleItem.bulkCreate(itemsToCreate);

            setStatus({ message: `Successfully imported ${itemsToCreate.length} payments! Go to Mortgage & Amortization to see the schedule.`, type: 'success' });
            setFile(null);
            setCsvText('');

        } catch (error) {
            console.error("Import failed:", error);
            setStatus({ message: `Import failed: ${error.message}`, type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6" />
                            Import Amortization Schedule
                        </CardTitle>
                        <CardDescription>
                            Upload your lender's CSV schedule. This creates the reference table that links to your actual payments in Transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="file" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="file">Upload File</TabsTrigger>
                                <TabsTrigger value="paste">Paste Data</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="file" className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">CSV File</label>
                                    <Input type="file" accept=".csv" onChange={handleFileChange} disabled={isProcessing} />
                                </div>
                                
                                {csvText && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">Preview</label>
                                        <Textarea 
                                            value={csvText.split('\n').slice(0, 5).join('\n')} 
                                            readOnly 
                                            className="h-32 font-mono text-xs"
                                            placeholder="CSV content will appear here..."
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="paste" className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Paste CSV Data</label>
                                    <Textarea 
                                        value={csvText}
                                        onChange={(e) => setCsvText(e.target.value)}
                                        className="h-64 font-mono text-xs"
                                        placeholder="Paste your CSV data here..."
                                        disabled={isProcessing}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Expected Format (9 columns):</p>
                                    <p className="font-mono text-xs">Payment #, Due Date, Scheduled Payment, Interest, Principal, Remaining Balance, Actual Payment, Status, Variance</p>
                                    <p className="text-xs mt-1 text-blue-600">Note: Actual Payment, Status, and Variance columns may be blank initially</p>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleImportFromText} 
                            disabled={!csvText.trim() || isProcessing} 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isProcessing ? 'Processing...' : 'Import Schedule'}
                        </Button>
                        
                        {status.message && (
                            <div className={`flex items-start gap-3 p-4 rounded-md text-sm ${
                                status.type === 'success' ? 'bg-green-100 text-green-800' :
                                status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : 
                                 status.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5" /> : 
                                 <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />}
                                <p>{status.message}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
