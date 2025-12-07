import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Download,
  Upload,
  Trash2,
  Database,
  CheckCircle,
  AlertCircle,
  Server,
  HardDrive,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

// Get all localStorage keys for this app
const APP_STORAGE_KEYS = [
  'fpm_member',
  'fpm_contribution',
  'fpm_transaction',
  'fpm_mortgage',
  'fpm_amortizationscheduleitem',
  'fpm_document',
  'fpm_property',
  'fpm_distribution',
  'fpm_files'
];

export default function Settings() {
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState(
    localStorage.getItem('fpm_api_endpoint') || ''
  );
  const fileInputRef = useRef(null);

  // Calculate storage stats
  const getStorageStats = () => {
    let totalSize = 0;
    const stats = {};

    APP_STORAGE_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const size = new Blob([data]).size;
        totalSize += size;
        const items = JSON.parse(data);
        stats[key.replace('fpm_', '')] = Array.isArray(items) ? items.length : Object.keys(items).length;
      } else {
        stats[key.replace('fpm_', '')] = 0;
      }
    });

    return { totalSize, stats };
  };

  const { totalSize, stats } = getStorageStats();

  // Export all data as JSON
  const handleExport = () => {
    setIsExporting(true);
    setStatus({ message: 'Preparing export...', type: 'info' });

    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        appName: 'Family Property Manager',
        data: {}
      };

      APP_STORAGE_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          exportData.data[key] = JSON.parse(data);
        }
      });

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fpm_backup_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save last export timestamp
      localStorage.setItem('fpm_last_export', new Date().toISOString());

      setStatus({
        message: `Successfully exported ${Object.keys(exportData.data).length} data collections!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setStatus({ message: `Export failed: ${error.message}`, type: 'error' });
    }

    setIsExporting(false);
  };

  // Import data from JSON file
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setStatus({ message: 'Reading file...', type: 'info' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // Validate import file structure
        if (!importData.data || !importData.version) {
          throw new Error('Invalid backup file format');
        }

        setStatus({ message: 'Importing data...', type: 'info' });

        // Import each data collection
        let imported = 0;
        Object.entries(importData.data).forEach(([key, value]) => {
          if (APP_STORAGE_KEYS.includes(key)) {
            localStorage.setItem(key, JSON.stringify(value));
            imported++;
          }
        });

        // Save import timestamp
        localStorage.setItem('fpm_last_import', new Date().toISOString());

        setStatus({
          message: `Successfully imported ${imported} data collections! Refresh the page to see changes.`,
          type: 'success'
        });

      } catch (error) {
        console.error('Import error:', error);
        setStatus({ message: `Import failed: ${error.message}`, type: 'error' });
      }

      setIsImporting(false);
    };

    reader.onerror = () => {
      setStatus({ message: 'Failed to read file', type: 'error' });
      setIsImporting(false);
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Merge imported data with existing (smart merge)
  const handleMergeImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setStatus({ message: 'Reading file for merge...', type: 'info' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        if (!importData.data || !importData.version) {
          throw new Error('Invalid backup file format');
        }

        setStatus({ message: 'Merging data...', type: 'info' });

        let mergedCount = 0;
        let newCount = 0;

        Object.entries(importData.data).forEach(([key, importedItems]) => {
          if (!APP_STORAGE_KEYS.includes(key)) return;

          const existingData = localStorage.getItem(key);
          let existingItems = existingData ? JSON.parse(existingData) : [];

          // Handle both arrays and objects (for files storage)
          if (Array.isArray(importedItems) && Array.isArray(existingItems)) {
            const existingIds = new Set(existingItems.map(item => item.id));

            importedItems.forEach(item => {
              if (!existingIds.has(item.id)) {
                existingItems.push(item);
                newCount++;
              } else {
                // Update existing item if imported is newer
                const existingIdx = existingItems.findIndex(e => e.id === item.id);
                const existingItem = existingItems[existingIdx];

                if (item.updated_date && existingItem.updated_date) {
                  if (new Date(item.updated_date) > new Date(existingItem.updated_date)) {
                    existingItems[existingIdx] = item;
                    mergedCount++;
                  }
                } else if (item.created_date && existingItem.created_date) {
                  if (new Date(item.created_date) > new Date(existingItem.created_date)) {
                    existingItems[existingIdx] = item;
                    mergedCount++;
                  }
                }
              }
            });
          } else if (typeof importedItems === 'object' && typeof existingItems === 'object') {
            // For object storage (like files)
            Object.entries(importedItems).forEach(([id, item]) => {
              if (!existingItems[id]) {
                existingItems[id] = item;
                newCount++;
              }
            });
          }

          localStorage.setItem(key, JSON.stringify(existingItems));
        });

        localStorage.setItem('fpm_last_import', new Date().toISOString());

        setStatus({
          message: `Merge complete! Added ${newCount} new items, updated ${mergedCount} existing items. Refresh to see changes.`,
          type: 'success'
        });

      } catch (error) {
        console.error('Merge error:', error);
        setStatus({ message: `Merge failed: ${error.message}`, type: 'error' });
      }

      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  // Clear all data
  const handleClearData = () => {
    APP_STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('fpm_last_export');
    localStorage.removeItem('fpm_last_import');

    setStatus({
      message: 'All data has been cleared. Refresh the page to start fresh.',
      type: 'success'
    });
  };

  // Save API endpoint
  const handleSaveEndpoint = () => {
    localStorage.setItem('fpm_api_endpoint', apiEndpoint);
    setStatus({ message: 'API endpoint saved!', type: 'success' });
  };

  const lastExport = localStorage.getItem('fpm_last_export');
  const lastImport = localStorage.getItem('fpm_last_import');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your data, backups, and sync configuration</p>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> :
               status.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5" /> :
               <RefreshCw className="w-5 h-5 mt-0.5 animate-spin" />}
              <p>{status.message}</p>
            </div>
          )}

          {/* Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Overview
              </CardTitle>
              <CardDescription>
                Current data stored in your browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.member || 0}</div>
                  <div className="text-sm text-slate-600">Members</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.transaction || 0}</div>
                  <div className="text-sm text-slate-600">Transactions</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.contribution || 0}</div>
                  <div className="text-sm text-slate-600">Contributions</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{stats.document || 0}</div>
                  <div className="text-sm text-slate-600">Documents</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 border-t pt-4">
                <span>Total storage used: <strong>{(totalSize / 1024).toFixed(1)} KB</strong></span>
                <div className="flex gap-4">
                  {lastExport && (
                    <span>Last export: {format(new Date(lastExport), 'MMM d, yyyy h:mm a')}</span>
                  )}
                  {lastImport && (
                    <span>Last import: {format(new Date(lastImport), 'MMM d, yyyy h:mm a')}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export/Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>
                Export your data to share with family members or import a backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900">Export All Data</h3>
                  <p className="text-sm text-slate-600">Download a complete backup as JSON file</p>
                </div>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>

              {/* Import (Replace) */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900">Import & Replace</h3>
                  <p className="text-sm text-slate-600">Replace all data with imported backup</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-file').click()}
                    disabled={isImporting}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? 'Importing...' : 'Import'}
                  </Button>
                </div>
              </div>

              {/* Import (Merge) */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                <div>
                  <h3 className="font-medium text-slate-900">Import & Merge</h3>
                  <p className="text-sm text-slate-600">Add new items from backup, keep existing data</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleMergeImport}
                    className="hidden"
                    id="merge-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('merge-file').click()}
                    disabled={isImporting}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Merge
                  </Button>
                </div>
              </div>

              {/* Collaboration Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Sharing with Family Members</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click <strong>Export</strong> to download your data</li>
                  <li>Share the JSON file with your brother-in-law (email, cloud drive, etc.)</li>
                  <li>They click <strong>Import</strong> or <strong>Merge</strong> to load it</li>
                  <li>For ongoing sync, export regularly and share the latest backup</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration (for future Pi backend) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Server Sync
                <Badge variant="outline" className="ml-2">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Configure your Raspberry Pi server for real-time sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-endpoint"
                    placeholder="http://192.168.1.100:3001/api"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleSaveEndpoint}>
                    Save
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  Enter your Pi server address once you have it set up
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Clear All Data</h3>
                  <p className="text-sm text-red-700">Permanently delete all data from this browser</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your data including members,
                        transactions, contributions, documents, and mortgage information.
                        This action cannot be undone. Make sure you have exported a backup first!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
