import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadPrivateFile } from "@/api/integrations";
import { Upload, Save, X, File as FileIcon, Loader2 } from "lucide-react";

export default function DocumentForm({ document, onSubmit, onCancel }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (document) {
            setName(document.name);
            setDescription(document.description || '');
            setCategory(document.category);
        } else {
            setName('');
            setDescription('');
            setCategory('');
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
                                    <SelectItem value="LLC">LLC</SelectItem>
                                    <SelectItem value="Property">Property</SelectItem>
                                    <SelectItem value="Mortgage">Mortgage</SelectItem>
                                    <SelectItem value="Financial">Financial</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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