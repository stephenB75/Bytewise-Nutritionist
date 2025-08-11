/**
 * Data Management Panel Component
 * Consolidated data export, sync, and management functionality - ByteWise Brand Styling
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Cloud,
  ChevronDown
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
          title: "PDF Report Generated ✅",
          description: "Your nutrition report has opened in a new tab. Use the download button on that page to save the PDF file.",
        });
        
        // Additional helpful information
        setTimeout(() => {
          toast({
            title: "PDF Available",
            description: "Look for the new tab with your ByteWise Nutrition Report. You can view it there and download it using the download button.",
          });
        }, 2000);
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (error: any) {
      // Log error for debugging but don't clutter console in production
      toast({
        title: "Export failed",
        description: `There was an error exporting your data: ${error.message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Show initial backup starting message
      toast({
        title: "Backup starting",
        description: "Preparing to backup your nutrition data to the database...",
      });

      // Make request to sync data endpoint
      const response = await fetch('/api/user/sync-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeProfile: true,
          includeMeals: true,
          includeRecipes: true,
          includeWaterIntake: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update data stats with backup info
        dataStats.lastSync = new Date().toLocaleDateString();
        dataStats.backupStatus = 'Completed';
        
        toast({
          title: "Auto Backup Complete ✅",
          description: `Successfully backed up ${data.itemsBackedUp || 0} items to the database. Your data is now safely stored and synchronized.`,
        });

        // Optional: Show detailed breakdown
        if (data.breakdown) {
          setTimeout(() => {
            toast({
              title: "Backup Details",
              description: `Profile: ${data.breakdown.profile || 0} items, Meals: ${data.breakdown.meals || 0} items, Recipes: ${data.breakdown.recipes || 0} items`,
            });
          }, 2000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Backup failed');
      }
    } catch (error: any) {
      // Error handled with user-friendly toast message
      toast({
        title: "Auto Backup Failed",
        description: error.message || "There was an error backing up your data to the database. Please try again.",
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

        {/* Data Management Content */}
        <div className="space-y-6">
                  {/* Export Section */}
                  <div className="p-6 bg-gradient-to-br from-[#1f4aa6]/10 to-[#1f4aa6]/5 rounded-2xl border border-[#1f4aa6]/20 backdrop-blur-md">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-[#1f4aa6]/20 rounded-2xl">
                        <Download className="w-8 h-8 text-[#1f4aa6]" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Export Data
                        </h4>
                        <p className="text-sm text-gray-300 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                          Download comprehensive nutrition reports with graphs and insights
                        </p>
                        <Badge className="bg-[#1f4aa6]/20 text-[#1f4aa6] border-[#1f4aa6]/30 mb-4">
                          PDF Format
                        </Badge>
                      </div>
                      <Button
                        onClick={handleExportData}
                        disabled={isExporting}
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#1f4aa6] to-[#1850a0] hover:from-[#1850a0] hover:to-[#164291] text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
                        data-testid="button-download-pdf"
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

                  <Separator className="bg-white/20" />

                  {/* Auto Backup Section */}
                  <div className="p-6 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-2xl border border-[#45c73e]/20 backdrop-blur-md">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-[#45c73e]/20 rounded-2xl">
                        <Cloud className="w-8 h-8 text-[#45c73e]" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Auto Backup
                        </h4>
                        <p className="text-sm text-gray-300 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                          Securely backup your profile, meals, recipes, and tracking data to the database
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

                  <Separator className="bg-white/20" />

                  {/* Danger Zone */}
                  <div className="p-6 bg-red-950/30 rounded-2xl border border-red-800/30 backdrop-blur-md">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 bg-red-600/20 rounded-2xl">
                        <Trash2 className="w-8 h-8 text-red-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-400 text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Danger Zone
                        </h4>
                        <p className="text-sm text-red-300 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                          Permanently delete all your nutrition data and progress
                        </p>
                        <Badge variant="destructive" className="bg-red-600/20 text-red-400 border-red-600/30 mb-4">
                          Irreversible Action
                        </Badge>
                      </div>
                      <Button
                        onClick={handleDeleteAllData}
                        variant="destructive"
                        size="lg"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
                      >
                        <Trash2 className="w-5 h-5 mr-3" strokeWidth={2.5} />
                        Delete All Data
                      </Button>
                    </div>
                  </div>
                </div>
      </div>
    </div>
  );
}