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
  Cloud
} from 'lucide-react';

export function DataManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);


  const handleExportData = async () => {
    console.log('🚀 PDF Export button clicked - starting process...');
    setIsExporting(true);
    
    try {
      // Import and use the PDF export utility
      console.log('📦 Importing PDF export utility...');
      const { generateProgressReportPDF } = await import('@/utils/pdfExport');
      
      console.log('🔄 Starting PDF generation...');
      const success = await generateProgressReportPDF();
      console.log('📄 PDF generation result:', success);
      
      if (success) {
        toast({
          title: "PDF Report Downloaded ✅",
          description: "Your nutrition report has been downloaded. Check your Downloads folder for the PDF file.",
        });
        
        console.log('✅ PDF export completed successfully');
      } else {
        throw new Error('PDF generation returned false');
      }
    } catch (error: any) {
      console.error('❌ PDF export failed:', error);
      
      // Show detailed error information
      toast({
        title: "Export Failed",
        description: `Unable to generate PDF report: ${error.message || 'Unknown error'}. Please check your internet connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      console.log('🏁 PDF export process finished');
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
    dataSize: '2.3 MB'
  };

  return (
    <div className="min-h-screen px-6 py-3">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-[#faed39] to-[#1f4aa6] rounded-xl">
              <Database className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'League Spartan', sans-serif" }}>Data Management</h2>
              <p className="text-gray-700" style={{ fontFamily: "'Work Sans', sans-serif" }}>Export, sync, and manage your nutrition data</p>
            </div>
          </div>
        </div>

        {/* Data Overview */}
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 p-6">
          <h3 className="text-xl font-semibold text-gray-950 mb-6" style={{ fontFamily: "'League Spartan', sans-serif" }}>Data Overview</h3>
        
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-[#45c73e]/10 to-[#45c73e]/5 rounded-lg border border-[#45c73e]/20">
              <div className="text-2xl font-bold text-[#45c73e]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.totalMeals}</div>
              <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Meals Logged</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#1f4aa6]/10 to-[#1f4aa6]/5 rounded-lg border border-[#1f4aa6]/20">
              <div className="text-2xl font-bold text-[#1f4aa6]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.totalDays}</div>
              <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Days Tracked</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-[#faed39]/10 to-[#faed39]/5 rounded-lg border border-[#faed39]/20">
              <div className="text-2xl font-bold text-[#faed39]" style={{ fontFamily: "'League Spartan', sans-serif" }}>{dataStats.dataSize}</div>
              <div className="text-sm text-gray-900" style={{ fontFamily: "'Work Sans', sans-serif" }}>Data Size</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border border-amber-300/40">
            <div className="flex items-center space-x-3">
              <Cloud className="w-5 h-5 text-[#1f4aa6]" />
              <div>
                <p className="font-medium text-gray-950" style={{ fontFamily: "'Work Sans', sans-serif" }}>Auto Sync Status</p>
                <p className="text-sm text-gray-900" style={{ fontFamily: "'Quicksand', sans-serif" }}>Your data syncs automatically as you use the app</p>
              </div>
            </div>
            <Badge className="bg-[#45c73e]/20 text-[#45c73e] border-[#45c73e]/30">
              Always Active
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
                        <h4 className="font-bold text-gray-950 text-xl mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                          Export Data
                        </h4>
                        <p className="text-sm text-gray-900 mb-4" style={{ fontFamily: "'Quicksand', sans-serif" }}>
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
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
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

                  <Separator className="bg-amber-300/40" />

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
                        className="w-full bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-xl rounded-2xl px-8 py-4 transition-all duration-300 font-semibold"
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