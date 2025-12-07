
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateFileSignedUrl } from "@/api/integrations";
import { FileText, Download, Trash2, Edit, Loader2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getFileTypeColor = (fileType) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('image')) return 'bg-blue-100 text-blue-800';
    if (fileType.includes('spreadsheet') || fileType.includes('csv')) return 'bg-green-100 text-green-800';
    if (fileType.includes('document')) return 'bg-purple-100 text-purple-800';
    return 'bg-slate-100 text-slate-800';
};

export default function DocumentCard({ document, onEdit, onDelete }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const { signed_url } = await CreateFileSignedUrl({ file_uri: document.file_uri });
            const link = window.document.createElement('a'); // Changed from document to window.document
            link.href = signed_url;
            link.setAttribute('download', document.file_name || 'download');
            window.document.body.appendChild(link); // Changed from document to window.document
            link.click();
            window.document.body.removeChild(link); // Changed from document to window.document
        } catch (error) {
            console.error("Error creating signed URL:", error);
            alert("Could not download file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-900 leading-tight">{document.name}</h3>
                        <Badge variant="outline" className={getFileTypeColor(document.file_type)}>
                            {document.file_name.split('.').pop()}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 mb-3">{document.description || "No description provided."}</p>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Download
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onDelete(document.id)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
