/**
 * Data Management Panel Component
 * Consolidated data export, sync, and management functionality - ByteWise Brand Styling
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Download,
  RefreshCw,
  Trash2,
  Database,
  Shield,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Cloud,
  HardDrive,
  Archive
} from 'lucide-react';

export function DataManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Import and use the PDF export utility
      const { generateProgressReportPDF } = await import('@/utils/pdfExport');
      const success = await generateProgressReportPDF();
      
      if (success) {
        toast({
          title: "Export successful",
          description: "Your progress report has been downloaded successfully!",
        });
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Sync complete",
        description: "Your data has been synchronized successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "There was an error syncing your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Cache cleared",
        description: "App cache has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Clear failed",
        description: "There was an error clearing the cache. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      try {
        const response = await fetch('/api/user/delete-data', {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast({
            title: "Data deleted",
            description: "All your data has been permanently deleted.",
          });
        } else {
          throw new Error('Failed to delete data');
        }
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "There was an error deleting your data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const dataStats = {
    totalMeals: 127,
    totalDays: 45,
    dataSize: '2.3 MB',
    lastSync: new Date().toLocaleDateString(),
    backupStatus: 'Up to date'
  };

  return (
    <div className="bg-black min-h-screen px-6 py-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#faed39] to-[#1f4aa6] rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>Data Management</h2>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Export, sync, and manage your nutrition data</p>
            </div>
          </div>
        </div>

        {/* Data Overview */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>Data Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-lg border border-[#45c73e]/20">
              <div className="text-2xl font-bold text-[#45c73e]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.totalMeals}</div>
              <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Meals Logged</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#1f4aa6]/10 to-[#1f4aa6]/5 rounded-lg border border-[#1f4aa6]/20">
              <div className="text-2xl font-bold text-[#1f4aa6]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.totalDays}</div>
              <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Days Tracked</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#faed39]/10 to-[#faed39]/5 rounded-lg border border-[#faed39]/20">
              <div className="text-2xl font-bold text-[#faed39]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.dataSize}</div>
              <div className="text-sm text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Data Size</div>
            </div>
        </div>

          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <Cloud className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>Backup Status</p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Last sync: {dataStats.lastSync}</p>
              </div>
            </div>
            <Badge className="bg-[#45c73e]/20 text-[#45c73e] border-[#45c73e]/30">
              {dataStats.backupStatus}
            </Badge>
          </div>
        </Card>

        {/* Export Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5 text-[#1f4aa6]" />
            <div>
              <h4 className="font-semibold text-white text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Export Your Data</h4>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Download comprehensive nutrition reports</p>
            </div>
          </div>
          <Badge className="bg-[#45c73e]/10 text-[#45c73e] border-[#45c73e]/20">
            Available
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>Progress Report (PDF)</p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Complete nutrition tracking report with charts and insights</p>
              </div>
            </div>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-[#1f4aa6] hover:bg-[#1850a0] text-white"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <Archive className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>Raw Data Export</p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Export all data in JSON format for backup or analysis</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#1f4aa6] text-[#1f4aa6] hover:bg-[#1f4aa6] hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
        </Card>

        {/* Sync & Maintenance */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <RefreshCw className="w-5 h-5 text-[#1f4aa6]" />
            <div>
              <h4 className="font-semibold text-white text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Sync & Maintenance</h4>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Keep your data synchronized and optimized</p>
            </div>
          </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <Cloud className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>Sync Data</p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Synchronize your data across all devices</p>
              </div>
            </div>
            <Button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="bg-[#45c73e] hover:bg-[#3ab82e] text-white"
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
          </div>

          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-white" style={{ fontFamily: "'Work Sans', sans-serif" }}>Clear Cache</p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Quicksand', sans-serif" }}>Clear app cache to free up storage space</p>
              </div>
            </div>
            <Button
              onClick={handleClearCache}
              disabled={isClearing}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </>
              )}
            </Button>
          </div>
        </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-950/30 backdrop-blur-md border border-red-800/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-400 text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Danger Zone</h4>
            <p className="text-red-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Irreversible actions - proceed with caution</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-950/40 rounded-lg border border-red-800/40">
          <div className="flex items-center space-x-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Delete All Data</p>
              <p className="text-sm text-red-400" style={{ fontFamily: "'Quicksand', sans-serif" }}>Permanently delete all your nutrition data and progress</p>
            </div>
          </div>
          <Button
            onClick={handleDeleteAllData}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </Button>
        </div>
        </Card>
      </div>
    </div>
  );
}