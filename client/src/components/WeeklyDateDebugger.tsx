/**
 * Weekly Date Debugger Component
 * Debug tool to investigate Monday 11th meal display issue
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bug, Eye, AlertTriangle } from 'lucide-react';
import { getWeekDates, getLocalDateKey } from '@/utils/dateUtils';

interface MealEntry {
  id: string;
  name: string;
  date: string;
  timestamp: string;
  calories: number;
}

export function WeeklyDateDebugger() {
  const [debugData, setDebugData] = useState<any>(null);
  
  const analyzeWeeklyDates = () => {
    try {
      // Get current week dates as calculated by WeeklyCaloriesCard
      const weekDatesArray = getWeekDates();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const weekDates = weekDatesArray.map((date, index) => ({
        day: dayNames[index],
        jsDate: date,
        dateKey: getLocalDateKey(date),
        dayOfMonth: date.getDate(),
        monthName: date.toLocaleString('default', { month: 'long' })
      }));

      // Get all stored meals
      const storedMeals: MealEntry[] = JSON.parse(localStorage.getItem('weeklyMeals') || '[]');
      
      // Find Monday's data specifically
      const mondayData = weekDates.find(day => day.day === 'Monday');
      const mondayMeals = storedMeals.filter(meal => meal.date === mondayData?.dateKey);
      
      // Find any meals from August 11th regardless of format
      const august11Meals = storedMeals.filter(meal => 
        meal.date.includes('-08-11') || 
        meal.date.includes('2025-08-11') ||
        meal.date === '2025-08-11'
      );
      
      // Analyze all unique date formats in storage
      const allDates = Array.from(new Set(storedMeals.map(meal => meal.date))).sort();
      
      // Group meals by date for analysis
      const mealsByDate = storedMeals.reduce((acc, meal) => {
        if (!acc[meal.date]) acc[meal.date] = [];
        acc[meal.date].push(meal);
        return acc;
      }, {} as Record<string, MealEntry[]>);

      const analysis = {
        todayDate: getLocalDateKey(),
        weekDates,
        mondayData,
        mondayMeals,
        august11Meals,
        totalMeals: storedMeals.length,
        uniqueDates: allDates,
        mealsByDate,
        dateFormatIssues: allDates.filter(date => 
          !date.match(/^\d{4}-\d{2}-\d{2}$/)
        )
      };
      
      setDebugData(analysis);
      
      console.log('Weekly Date Debug Analysis:', analysis);
      
    } catch (error) {
      console.error('Debug analysis failed:', error);
      setDebugData({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  useEffect(() => {
    analyzeWeeklyDates();
  }, []);

  if (!debugData) {
    return (
      <Card className="p-4 border-2 border-yellow-300 bg-yellow-50">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-yellow-600" />
          <span className="text-yellow-800">Loading date analysis...</span>
        </div>
      </Card>
    );
  }

  if (debugData.error) {
    return (
      <Card className="p-4 border-2 border-red-300 bg-red-50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-red-800">Debug Error: {debugData.error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-yellow-300 bg-yellow-50/90">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Weekly Date Debugger</h3>
          </div>
          <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
            Monday 11th Issue
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Week Dates */}
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-900">Current Week Calculation:</h4>
            <div className="space-y-1 text-sm">
              {debugData.weekDates.map((day: any, i: number) => (
                <div 
                  key={i} 
                  className={`p-2 rounded ${day.day === 'Monday' ? 'bg-yellow-200 border border-yellow-400' : 'bg-white/70'}`}
                >
                  <div className="font-medium">{day.day}</div>
                  <div className="text-gray-600">Date Key: {day.dateKey}</div>
                  <div className="text-gray-600">Day: {day.monthName} {day.dayOfMonth}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monday Analysis */}
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-900">Monday Analysis:</h4>
            <div className="p-3 bg-white/70 rounded">
              <div className="space-y-1 text-sm">
                <div><strong>Expected Monday Date:</strong> {debugData.mondayData?.dateKey}</div>
                <div><strong>Monday Day:</strong> {debugData.mondayData?.monthName} {debugData.mondayData?.dayOfMonth}</div>
                <div><strong>Meals Found for Monday:</strong> {debugData.mondayMeals.length}</div>
              </div>
              
              {debugData.mondayMeals.length > 0 && (
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <div className="text-xs font-medium text-green-800">Monday Meals Found:</div>
                  {debugData.mondayMeals.map((meal: MealEntry) => (
                    <div key={meal.id} className="text-xs text-green-700">
                      • {meal.name} - {meal.calories} cal
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* August 11th Specific Check */}
        <div className="p-3 bg-white/70 rounded">
          <h4 className="font-medium text-yellow-900 mb-2">August 11th Meal Search:</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Meals with August 11th date:</strong> {debugData.august11Meals.length}</div>
            {debugData.august11Meals.length > 0 && (
              <div className="space-y-1">
                {debugData.august11Meals.map((meal: MealEntry) => (
                  <div key={meal.id} className="p-2 bg-blue-100 rounded text-xs">
                    <div><strong>Name:</strong> {meal.name}</div>
                    <div><strong>Date:</strong> {meal.date}</div>
                    <div><strong>Timestamp:</strong> {meal.timestamp}</div>
                    <div><strong>Calories:</strong> {meal.calories}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Unique Dates */}
        <div className="p-3 bg-white/70 rounded">
          <h4 className="font-medium text-yellow-900 mb-2">All Meal Dates in Storage:</h4>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {debugData.uniqueDates.map((date: string) => (
              <div key={date} className="flex justify-between">
                <span className={date.includes('2025-08-11') ? 'font-bold text-red-600' : ''}>{date}</span>
                <span className="text-gray-500">({debugData.mealsByDate[date]?.length} meals)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Date Format Issues */}
        {debugData.dateFormatIssues.length > 0 && (
          <div className="p-3 bg-red-100 rounded">
            <h4 className="font-medium text-red-900 mb-2">Date Format Issues Found:</h4>
            <div className="text-sm space-y-1">
              {debugData.dateFormatIssues.map((date: string) => (
                <div key={date} className="text-red-800">❌ {date}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={analyzeWeeklyDates} size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            Refresh Analysis
          </Button>
          
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
            }}
            size="sm" 
            variant="outline"
          >
            Copy Debug Data
          </Button>
        </div>

        <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
          💡 This debug panel helps identify why Monday 11th meals aren't showing in the weekly summary.
          Check if the Monday date calculation matches the meal date format.
        </div>
      </div>
    </Card>
  );
}