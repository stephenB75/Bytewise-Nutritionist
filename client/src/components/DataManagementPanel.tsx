/**
 * Data Management Panel Component
 * 
 * Consolidated data export, sync, and management functionality
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  RefreshCw,
  Trash2,
  Database,
  Shield,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function DataManagementPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Generate PDF report using jsPDF
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf', includeImages: true }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bytewise-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
      console.log('Data synchronized');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      console.log('Data deletion confirmed');
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Data Management</h3>
      
      <div className="space-y-6">
        {/* Export Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Export Your Data</h4>
              <p className="text-sm text-gray-600">Download comprehensive nutrition reports</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <FileText className="w-3 h-3 mr-1" />
              PDF Ready
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to PDF
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // Export as JSON
                const data = {
                  exportDate: new Date().toISOString(),
                  meals: [],
                  recipes: [],
                  achievements: []
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bytewise-data-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Database className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        <Separator />

        {/* Sync & Backup Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Sync & Backup</h4>
              <p className="text-sm text-gray-600">Keep your data safe and synchronized</p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto-sync On
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleSyncData}
              disabled={isSyncing}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Backup Settings
            </Button>
          </div>
        </div>

        <Separator />

        {/* Data Stats */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Your Data Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className="text-xs text-gray-600">Days Tracked</p>
              <p className="font-bold text-gray-900">47</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Database className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-gray-600">Meals Logged</p>
              <p className="font-bold text-gray-900">156</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 mx-auto text-purple-600 mb-1" />
              <p className="text-xs text-gray-600">Recipes Created</p>
              <p className="font-bold text-gray-900">12</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 mx-auto text-orange-600 mb-1" />
              <p className="text-xs text-gray-600">Data Size</p>
              <p className="font-bold text-gray-900">2.4 MB</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-700">Danger Zone</h4>
            </div>
            <p className="text-sm text-red-600 mb-3">Permanently delete all your nutrition data</p>
            <Button 
              variant="destructive" 
              className="w-full justify-center hover:bg-red-600 transition-all duration-200"
              onClick={handleDeleteAllData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}