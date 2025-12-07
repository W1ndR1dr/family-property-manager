
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateFileSignedUrl } from "@/api/integrations";
import { FileText, Download, Trash2, Edit, Loader2, ChevronDown, Clock, AlertTriangle, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, differenceInDays, isPast } from "date-fns";

const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType?.includes('image')) return 'bg-blue-100 text-blue-800';
    if (fileType?.includes('spreadsheet') || fileType?.includes('csv')) return 'bg-green-100 text-green-800';
    if (fileType?.includes('document')) return 'bg-purple-100 text-purple-800';
    return 'bg-slate-100 text-slate-800';
};

const getExpirationStatus = (expirationDate) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = differenceInDays(expDate, new Date());

    if (isPast(expDate)) {
        return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
        return { status: 'expiring-soon', label: `Expires in ${daysUntilExpiry} days`, color: 'bg-amber-100 text-amber-800', icon: Clock };
    } else if (daysUntilExpiry <= 90) {
        return { status: 'expiring', label: `Expires ${format(expDate, 'MMM d, yyyy')}`, color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
    return { status: 'valid', label: `Expires ${format(expDate, 'MMM d, yyyy')}`, color: 'bg-green-100 text-green-800', icon: Clock };
};

export default function DocumentCard({ document, onEdit, onDelete, linkedTransaction }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const expirationStatus = getExpirationStatus(document.expiration_date);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const { signed_url } = await CreateFileSignedUrl({ file_uri: document.file_uri });
            const link = window.document.createElement('a');
            link.href = signed_url;
            link.setAttribute('download', document.file_name || 'download');
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        } catch (error) {
            console.error("Error creating signed URL:", error);
            alert("Could not download file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card className={`bg-white border hover:shadow-md transition-shadow ${
            expirationStatus?.status === 'expired' ? 'border-red-300' :
            expirationStatus?.status === 'expiring-soon' ? 'border-amber-300' :
            'border-slate-200'
        }`}>
            <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                    expirationStatus?.status === 'expired' ? 'bg-red-100' :
                    expirationStatus?.status === 'expiring-soon' ? 'bg-amber-100' :
                    'bg-slate-100'
                }`}>
                    <FileText className={`w-6 h-6 ${
                        expirationStatus?.status === 'expired' ? 'text-red-600' :
                        expirationStatus?.status === 'expiring-soon' ? 'text-amber-600' :
                        'text-slate-600'
                    }`} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-slate-900 leading-tight">{document.name}</h3>
                        <Badge variant="outline" className={getFileTypeColor(document.file_type)}>
                            {document.file_name?.split('.').pop() || 'file'}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{document.description || "No description provided."}</p>

                    {/* Expiration and Link badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {expirationStatus && (
                            <Badge className={expirationStatus.color}>
                                <expirationStatus.icon className="w-3 h-3 mr-1" />
                                {expirationStatus.label}
                            </Badge>
                        )}
                        {linkedTransaction && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Link2 className="w-3 h-3 mr-1" />
                                ${linkedTransaction.amount} - {linkedTransaction.category?.replace(/_/g, ' ')}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
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
