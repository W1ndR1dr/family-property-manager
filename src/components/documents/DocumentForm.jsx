import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { UploadPrivateFile } from "@/api/integrations";
import { Upload, Save, X, File as FileIcon, Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Document categories aligned with property management and tax needs
const DOCUMENT_CATEGORIES = [
  { value: "Tax", label: "Tax Documents", description: "Tax returns, K-1s, depreciation schedules" },
  { value: "Legal", label: "Legal", description: "LLC docs, contracts, agreements" },
  { value: "Insurance", label: "Insurance", description: "Policies, claims, certificates" },
  { value: "Receipts", label: "Receipts", description: "Expense receipts for tax deductions" },
  { value: "Leases", label: "Leases", description: "Tenant leases and agreements" },
  { value: "Property", label: "Property", description: "Deeds, titles, inspections" },
  { value: "Mortgage", label: "Mortgage", description: "Loan documents, statements" },
  { value: "Financial", label: "Financial", description: "Bank statements, reports" },
  { value: "Other", label: "Other", description: "Miscellaneous documents" }
];

export default function DocumentForm({ document, transactions, onSubmit, onCancel }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [expirationDate, setExpirationDate] = useState(null);
    const [linkedTransactionId, setLinkedTransactionId] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (document) {
            setName(document.name);
            setDescription(document.description || '');
            setCategory(document.category);
            setExpirationDate(document.expiration_date ? new Date(document.expiration_date) : null);
            setLinkedTransactionId(document.linked_transaction_id || '');
        } else {
            setName('');
            setDescription('');
            setCategory('');
            setExpirationDate(null);
            setLinkedTransactionId('');
            setFile(null);
        }
    }, [document]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!name && !document) {
                setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category) {
            alert("Please select a category.");
            return;
        }

        // For editing, file is optional. For new documents, file is required.
        if (!document && !file) {
            alert("Please select a file.");
            return;
        }

        setIsUploading(true);
        try {
            let documentData = {
                name,
                description,
                category,
                expiration_date: expirationDate ? expirationDate.toISOString() : null,
                linked_transaction_id: linkedTransactionId || null,
            };

            // Only upload a new file if one was selected
            if (file) {
                const { file_uri } = await UploadPrivateFile({ file });
                documentData = {
                    ...documentData,
                    file_uri,
                    file_name: file.name,
                    file_type: file.type,
                };
            }

            await onSubmit(documentData);
        } catch (error) {
            console.error("Error saving document:", error);
            alert("Failed to save document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Filter transactions for expense receipts linking
    const expenseTransactions = transactions?.filter(t => t.type === 'expense') || [];

    return (
        <Card className="bg-white border border-slate-200">
            <CardHeader>
                <CardTitle>{document ? 'Edit Document' : 'Upload New Document'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="doc-name">Document Name</Label>
                            <Input
                                id="doc-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g., LLC Operating Agreement"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doc-category">Category</Label>
                            <Select onValueChange={setCategory} value={category} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            <div className="flex flex-col">
                                                <span>{cat.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {category && (
                                <p className="text-xs text-slate-500">
                                    {DOCUMENT_CATEGORIES.find(c => c.value === category)?.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Expiration Date (Optional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {expirationDate ? format(expirationDate, 'PPP') : 'No expiration'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={expirationDate}
                                        onSelect={setExpirationDate}
                                        initialFocus
                                    />
                                    {expirationDate && (
                                        <div className="p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setExpirationDate(null)}
                                            >
                                                Clear Date
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-slate-500">
                                For insurance policies, leases, or other time-sensitive documents
                            </p>
                        </div>

                        {category === 'Receipts' && expenseTransactions.length > 0 && (
                            <div className="space-y-2">
                                <Label>Link to Transaction (Optional)</Label>
                                <Select onValueChange={setLinkedTransactionId} value={linkedTransactionId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a transaction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {expenseTransactions.slice(0, 20).map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {format(new Date(t.date), 'MM/dd/yy')} - ${t.amount} - {t.description?.substring(0, 30)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">
                                    Link this receipt to an expense for tax documentation
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doc-description">Description</Label>
                        <Textarea
                            id="doc-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a brief description of the document's content..."
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">
                            File {document && <span className="text-sm text-slate-500">(optional - leave empty to keep current file)</span>}
                        </Label>
                        <Input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
                        <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('file-upload').click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            {document ? 'Replace File' : 'Choose File'}
                        </Button>
                        
                        {document && !file && (
                            <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded-md flex items-center gap-2">
                                <FileIcon className="w-4 h-4" />
                                <span>Current: {document.file_name}</span>
                            </div>
                        )}
                        
                        {file && (
                            <div className="text-sm text-slate-600 p-2 bg-blue-50 rounded-md flex items-center gap-2">
                                <FileIcon className="w-4 h-4" />
                                <span>New: {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {document ? 'Updating...' : 'Uploading...'}</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> {document ? 'Update Document' : 'Save Document'}</>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}