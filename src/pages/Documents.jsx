import React, { useState, useEffect, useMemo } from 'react';
import { Document, Transaction } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Folder, Loader2, AlertTriangle, Clock, Filter } from 'lucide-react';
import { differenceInDays, isPast } from 'date-fns';

import DocumentForm from '../components/documents/DocumentForm';
import DocumentCard from '../components/documents/DocumentCard';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docs, txns] = await Promise.all([
                Document.list('-created_date'),
                Transaction.list('-date')
            ]);
            setDocuments(docs);
            setTransactions(txns);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDocuments = async () => {
        try {
            const docs = await Document.list('-created_date');
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents:", error);
        }
    };

    // Get linked transaction for a document
    const getLinkedTransaction = (doc) => {
        if (!doc.linked_transaction_id) return null;
        return transactions.find(t => t.id === doc.linked_transaction_id);
    };

    // Documents with expiration warnings
    const expiringDocuments = useMemo(() => {
        return documents.filter(doc => {
            if (!doc.expiration_date) return false;
            const expDate = new Date(doc.expiration_date);
            const daysUntilExpiry = differenceInDays(expDate, new Date());
            return isPast(expDate) || daysUntilExpiry <= 30;
        }).sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
    }, [documents]);

    const handleFormSubmit = async (formData) => {
        if (editingDocument) {
            await Document.update(editingDocument.id, formData);
        } else {
            await Document.create(formData);
        }
        setShowForm(false);
        setEditingDocument(null);
        await loadDocuments();
    };

    const handleEdit = (document) => {
        setEditingDocument(document);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
            try {
                await Document.delete(id);
                await loadDocuments();
            } catch (error) {
                console.error("Failed to delete document:", error);
                alert("Could not delete document. Please try again.");
            }
        }
    };

    // Filter documents based on category and tab
    const filteredDocuments = useMemo(() => {
        let filtered = documents;

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(doc => doc.category === categoryFilter);
        }

        // Filter by tab
        if (activeTab === 'receipts') {
            filtered = filtered.filter(doc => doc.category === 'Receipts');
        } else if (activeTab === 'expiring') {
            filtered = filtered.filter(doc => {
                if (!doc.expiration_date) return false;
                const daysUntilExpiry = differenceInDays(new Date(doc.expiration_date), new Date());
                return isPast(new Date(doc.expiration_date)) || daysUntilExpiry <= 90;
            });
        }

        return filtered;
    }, [documents, categoryFilter, activeTab]);

    const documentsByCategory = useMemo(() => {
        return filteredDocuments.reduce((acc, doc) => {
            const category = doc.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(doc);
            return acc;
        }, {});
    }, [filteredDocuments]);

    // Available categories from documents
    const availableCategories = useMemo(() => {
        const cats = new Set(documents.map(d => d.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [documents]);

    const orderedCategories = ['Tax', 'Legal', 'Insurance', 'Receipts', 'Leases', 'Property', 'Mortgage', 'Financial', 'LLC', 'Other'];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Hub</h1>
                            <p className="text-slate-600">Central repository for all important files and documents.</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingDocument(null);
                                setShowForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Upload Document
                        </Button>
                    </div>

                    {/* Expiration Alerts */}
                    {expiringDocuments.length > 0 && !showForm && (
                        <Card className="mb-6 border-amber-200 bg-amber-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                                    <AlertTriangle className="w-5 h-5" />
                                    Documents Requiring Attention
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {expiringDocuments.map(doc => {
                                        const isExpired = isPast(new Date(doc.expiration_date));
                                        return (
                                            <Badge
                                                key={doc.id}
                                                className={`cursor-pointer ${isExpired ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                                                onClick={() => handleEdit(doc)}
                                            >
                                                {isExpired ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                {doc.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {showForm && (
                        <div className="mb-8">
                            <DocumentForm
                                document={editingDocument}
                                transactions={transactions}
                                onSubmit={handleFormSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingDocument(null);
                                }}
                            />
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : documents.length === 0 && !showForm ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <Folder className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-medium text-slate-900">No documents uploaded</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by uploading your first document.</p>
                        </div>
                    ) : (
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
                                    <div className="flex gap-2">
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[160px]">
                                                <Filter className="w-4 h-4 mr-2" />
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {availableCategories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="all">All Documents</TabsTrigger>
                                        <TabsTrigger value="receipts">Receipts</TabsTrigger>
                                        <TabsTrigger value="expiring">
                                            Expiring Soon
                                            {expiringDocuments.length > 0 && (
                                                <Badge className="ml-2 bg-amber-100 text-amber-800" variant="secondary">
                                                    {expiringDocuments.length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value={activeTab} className="mt-6">
                                        {filteredDocuments.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <Folder className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                                <p>No documents found for this filter.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                {orderedCategories.map(category => (
                                                    documentsByCategory[category] && (
                                                        <div key={category}>
                                                            <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                                                                {category}
                                                                <Badge variant="outline" className="ml-2">
                                                                    {documentsByCategory[category].length}
                                                                </Badge>
                                                            </h2>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                {documentsByCategory[category].map(doc => (
                                                                    <DocumentCard
                                                                        key={doc.id}
                                                                        document={doc}
                                                                        linkedTransaction={getLinkedTransaction(doc)}
                                                                        onEdit={handleEdit}
                                                                        onDelete={handleDelete}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}