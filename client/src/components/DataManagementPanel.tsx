/**
 * Data Management Panel Component
 * 
 * Consolidated data export, sync, and management functionality
 */

import { useState } from 'react';
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
      // Import and use the PDF export utility
      const { generateProgressReportPDF } = await import('@/utils/pdfExport');
      const success = await generateProgressReportPDF();
      
      if (success) {
        // Show success toast
        const toastEvent = new CustomEvent('show-toast', {
          detail: { 
            message: 'Progress report downloaded successfully!',
            type: 'success' 
          }
        });
        window.dispatchEvent(toastEvent);
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      
      // Show error toast
      const toastEvent = new CustomEvent('show-toast', {
        detail: { 
          message: 'Export failed. Please try again.',
          type: 'error' 
        }
      });
      window.dispatchEvent(toastEvent);
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
    <div className="p-6">
      <h3 className="text-2xl font-bold text-white mb-6">Data Management</h3>
      
      <div className="space-y-6">
        {/* Export Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-white text-lg">Export Your Data</h4>
              <p className="text-gray-400">Download comprehensive nutrition reports</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <FileText className="w-3 h-3 mr-1" />
              PDF Ready
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
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
          </div>
        </div>

        <Separator />

        {/* Sync & Backup Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-white text-lg">Sync & Backup</h4>
              <p className="text-gray-400">Keep your data safe and synchronized</p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
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
    </div>
  );
}