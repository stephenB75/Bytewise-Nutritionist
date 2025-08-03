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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Database className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'League Spartan', sans-serif" }}>Data Management</h2>
            <p className="text-gray-600">Export, sync, and manage your nutrition data</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Export Section */}
        <Card className="bg-white border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Export Your Data</h4>
              <p className="text-gray-600">Download comprehensive nutrition reports</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
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

        </Card>

        {/* Sync & Backup Section */}
        <Card className="bg-white border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Sync & Backup</h4>
              <p className="text-gray-600">Keep your data safe and synchronized</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Auto-sync On
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={handleSyncData}
              disabled={isSyncing}
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-900/20"
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
              className="border-emerald-400 text-emerald-400 hover:bg-emerald-900/20"
            >
              <Shield className="w-4 h-4 mr-2" />
              Backup Settings
            </Button>
          </div>
        </div>

        <Separator />

        {/* Data Stats */}
        <div>
          <h4 className="font-medium text-white mb-3">Your Data Summary</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
              <Calendar className="w-5 h-5 mx-auto text-blue-400 mb-1" />
              <p className="text-xs text-gray-400">Days Tracked</p>
              <p className="font-bold text-white">47</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
              <Database className="w-5 h-5 mx-auto text-green-400 mb-1" />
              <p className="text-xs text-gray-400">Meals Logged</p>
              <p className="font-bold text-white">156</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
              <FileText className="w-5 h-5 mx-auto text-purple-400 mb-1" />
              <p className="text-xs text-gray-400">Recipes Created</p>
              <p className="font-bold text-white">12</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
              <Shield className="w-5 h-5 mx-auto text-orange-400 mb-1" />
              <p className="text-xs text-gray-400">Data Size</p>
              <p className="font-bold text-white">2.4 MB</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div>
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h4 className="font-medium text-red-300">Danger Zone</h4>
            </div>
            <p className="text-sm text-red-400 mb-3">Permanently delete all your nutrition data</p>
            <Button 
              variant="destructive" 
              className="w-full justify-center bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
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