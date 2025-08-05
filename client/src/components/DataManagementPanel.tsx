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
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Cloud
} from 'lucide-react';

export function DataManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);


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
      // Auto backup user data to database
      const response = await fetch('/api/user/sync-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          timestamp: new Date().toISOString(),
          backupType: 'auto_sync'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Backup complete",
          description: `Your nutrition data has been automatically backed up to the database. ${data.itemsBackedUp || 0} items synchronized.`,
        });
      } else {
        throw new Error('Backup failed');
      }
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "There was an error backing up your data to the database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
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

        <div className="flex justify-center">
          <div className="w-full max-w-md p-6 bg-gradient-to-br from-white/15 to-white/5 rounded-2xl border border-white/30 backdrop-blur-md">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#1f4aa6]/20 rounded-2xl">
                <FileText className="w-8 h-8 text-[#1f4aa6]" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Progress Report
                </h4>
                <p className="text-sm text-gray-300 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  Complete nutrition tracking report with charts, insights, and progress analysis
                </p>
                <Badge className="bg-[#45c73e]/20 text-[#45c73e] border-[#45c73e]/30 mb-4">
                  PDF Format
                </Badge>
              </div>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                size="lg"
                className="w-full bg-gradient-to-r from-[#1f4aa6] to-[#1850a0] hover:from-[#1850a0] hover:to-[#164291] text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" strokeWidth={2.5} />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-3" strokeWidth={2.5} />
                    Download PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        </Card>

        {/* Auto Backup */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Cloud className="w-5 h-5 text-[#1f4aa6]" />
            <div>
              <h4 className="font-semibold text-white text-lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>Auto Backup</h4>
              <p className="text-gray-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>Automatically backup your data to the database</p>
            </div>
          </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md p-6 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-2xl border border-[#45c73e]/20 backdrop-blur-md">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-[#45c73e]/20 rounded-2xl">
                <Cloud className="w-8 h-8 text-[#45c73e]" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-white text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Auto Backup
                </h4>
                <p className="text-sm text-gray-300 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  Automatically backup your nutrition data to the database for safekeeping
                </p>
                <Badge className="bg-[#45c73e]/20 text-[#45c73e] border-[#45c73e]/30 mb-4">
                  Database Backup
                </Badge>
              </div>
              <Button
                onClick={handleSyncData}
                disabled={isSyncing}
                size="lg"
                className="w-full bg-gradient-to-r from-[#45c73e] to-[#3ab82e] hover:from-[#3ab82e] hover:to-[#2d8f26] text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" strokeWidth={2.5} />
                    Backing Up...
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5 mr-3" strokeWidth={2.5} />
                    Start Auto Backup
                  </>
                )}
              </Button>
            </div>
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