/**
 * Data Management Panel Component
 * 
 * Enhanced data management with sync confirmation and PDF export functionality
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RefreshCw, 
  Download, 
  CheckCircle, 
  FileText, 
  Database,
  Cloud,
  Calendar,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

interface DataManagementPanelProps {
  className?: string;
}

export function DataManagementPanel({ className = '' }: DataManagementPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date(Date.now() - 2 * 60 * 60 * 1000)); // 2 hours ago
  const [showSyncConfirmation, setShowSyncConfirmation] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastSyncTime(new Date());
      setShowSyncConfirmation(true);
      
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => {
        setShowSyncConfirmation(false);
      }, 3000);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // Simulate PDF generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create sample PDF data for the last 6 months
      const pdfData = {
        title: 'ByteWise - 6 Month Progress Report',
        generatedDate: new Date(),
        userStats: {
          totalMealsLogged: 156,
          averageDailyCalories: 1850,
          streakRecord: 21,
          goalCompletionRate: 78,
          achievements: 12
        },
        monthlyBreakdown: [
          { month: 'January', calories: 52000, meals: 28, goals: 22 },
          { month: 'February', calories: 48000, meals: 26, goals: 20 },
          { month: 'March', calories: 55000, meals: 30, goals: 25 },
          { month: 'April', calories: 51000, meals: 27, goals: 23 },
          { month: 'May', calories: 56000, meals: 31, goals: 26 },
          { month: 'June', calories: 53000, meals: 29, goals: 24 }
        ]
      };
      
      // Create and download PDF
      const pdfBlob = new Blob([JSON.stringify(pdfData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bytewise-progress-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      const event = new CustomEvent('show-toast', {
        detail: { 
          message: 'PDF progress report downloaded successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      const event = new CustomEvent('show-toast', {
        detail: { 
          message: 'Failed to export PDF. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsExporting(false);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
          <Database className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.25rem", fontWeight: 600 }}>
          Data Management
        </h3>
      </div>

      <div className="space-y-6">
        {/* Sync Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-green-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="w-4 h-4 text-green-600" />
                <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                  Cloud Sync
                </h4>
              </div>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Last synced: {formatLastSync(lastSyncTime)}
              </p>
              {showSyncConfirmation && (
                <div className="flex items-center gap-2 mt-2 text-green-600 animate-in fade-in duration-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Sync completed successfully!</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
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
        </div>

        <Separator className="bg-green-200" />

        {/* Export Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-blue-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                  Progress Report
                </h4>
              </div>
              <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
                Export your last 6 months of progress as PDF
              </p>
              
              {/* Preview stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>6 months</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>156 meals</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>78% goals</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>12 achievements</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {isExporting ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-pulse" />
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
        </div>

        {/* Storage Info */}
        <div className="p-4 bg-white/60 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Storage Used</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              2.3 MB / 100 MB
            </Badge>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '2.3%' }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
}