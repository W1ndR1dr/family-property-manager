import React, { useState, useEffect, useMemo } from 'react';
import { Document } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Loader2 } from 'lucide-react';

import DocumentForm from '../components/documents/DocumentForm';
import DocumentCard from '../components/documents/DocumentCard';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await Document.list('-created_date');
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const documentsByCategory = useMemo(() => {
        return documents.reduce((acc, doc) => {
            const category = doc.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(doc);
            return acc;
        }, {});
    }, [documents]);

    const orderedCategories = ['LLC', 'Property', 'Mortgage', 'Financial', 'Other'];

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

                    {showForm && (
                        <div className="mb-8">
                            <DocumentForm
                                document={editingDocument}
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
                        <div className="space-y-8">
                            {orderedCategories.map(category => (
                                documentsByCategory[category] && (
                                    <div key={category}>
                                        <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">{category}</h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {documentsByCategory[category].map(doc => (
                                                <DocumentCard 
                                                    key={doc.id} 
                                                    document={doc} 
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
                </div>
            </div>
        </div>
    );
}