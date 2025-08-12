/**
 * Meal Date Fixer Button Component
 * Allows users to manually check and fix meal date mismatches
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { checkMealDateMismatches, fixMealDateMismatches, DateMismatch } from '@/utils/mealDateFixer';
import { useToast } from '@/hooks/use-toast';

interface MealDateFixerButtonProps {
  compact?: boolean;
  className?: string;
}

export function MealDateFixerButton({ compact = false, className = '' }: MealDateFixerButtonProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [mismatches, setMismatches] = useState<DateMismatch[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const { toast } = useToast();

  const handleCheck = () => {
    setIsChecking(true);
    
    // Small delay for UX
    setTimeout(() => {
      const result = checkMealDateMismatches();
      setMismatches(result.mismatches);
      setHasChecked(true);
      setIsChecking(false);
      
      if (result.mismatches.length === 0) {
        toast({
          title: "✅ All Dates Correct",
          description: "No meal date corrections needed.",
          duration: 3000,
        });
      }
    }, 500);
  };

  const handleFix = () => {
    const result = fixMealDateMismatches();
    
    if (result.success && result.fixedCount > 0) {
      toast({
        title: "📅 Dates Fixed",
        description: `Corrected ${result.fixedCount} meal entries to the proper days.`,
        duration: 4000,
      });
      
      setMismatches([]);
      setHasChecked(true);
    } else if (result.success && result.fixedCount === 0) {
      toast({
        title: "✅ No Changes Needed",
        description: "All meal dates are already correct.",
        duration: 3000,
      });
    } else {
      toast({
        title: "❌ Fix Failed", 
        description: result.error || "Could not fix meal dates.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Button
          onClick={handleCheck}
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              Check Meal Dates
            </>
          )}
        </Button>
        
        {hasChecked && mismatches.length > 0 && (
          <Button
            onClick={handleFix}
            variant="default"
            size="sm"
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Fix {mismatches.length} Date{mismatches.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Meal Date Checker</h3>
          </div>
          {hasChecked && (
            <Badge variant={mismatches.length > 0 ? "destructive" : "default"}>
              {mismatches.length > 0 ? `${mismatches.length} issues` : 'All correct'}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-gray-600">
          Check if any meal entries are logged on the wrong day and fix them automatically.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCheck}
            disabled={isChecking}
            variant="outline"
            className="flex-1"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Check Dates
              </>
            )}
          </Button>
          
          {hasChecked && mismatches.length > 0 && (
            <Button
              onClick={handleFix}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Fix Issues
            </Button>
          )}
        </div>
        
        {hasChecked && mismatches.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Found {mismatches.length} date mismatch{mismatches.length !== 1 ? 'es' : ''}:
                </p>
                <ul className="text-orange-700 dark:text-orange-300 space-y-1">
                  {mismatches.slice(0, 3).map((mismatch, index) => (
                    <li key={index}>
                      • "{mismatch.meal}" on {mismatch.storedDate} → should be {mismatch.actualDate}
                    </li>
                  ))}
                  {mismatches.length > 3 && (
                    <li>• ... and {mismatches.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}