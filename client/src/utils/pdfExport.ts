/**
 * ByteWise Nutritionist PDF Export Utility
 * 
 * Creates comprehensive PDF reports with nutrition data, achievements, 
 * fasting sessions, water intake, and personal progress insights
 * Features yellow/amber styling to match app branding
 */

import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { apiRequest, authFetch } from '@/lib/queryClient';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface DailyNutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  sodium: number;
  vitaminC: number;
  vitaminD: number;
  vitaminB12: number;
  folate: number;
  iron: number;
  calcium: number;
  zinc: number;
  magnesium: number;
  mealsCount: number;
}

interface WeeklyNutritionData {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgSugar: number;
  avgFiber: number;
  avgSodium: number;
  avgVitaminC: number;
  avgVitaminD: number;
  avgVitaminB12: number;
  avgFolate: number;
  avgIron: number;
  avgCalcium: number;
  avgZinc: number;
  avgMagnesium: number;
  totalMeals: number;
  daysWithData: number;
}

/** Same daily values as the dashboard Essential Micronutrients cards. */
const MICRO_DV: Array<{ key: keyof DailyNutritionData; label: string; goal: number; unit: string }> = [
  { key: 'vitaminC', label: 'Vitamin C', goal: 90, unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', goal: 20, unit: 'μg' },
  { key: 'vitaminB12', label: 'Vitamin B12', goal: 2.4, unit: 'μg' },
  { key: 'folate', label: 'Folate', goal: 400, unit: 'μg' },
  { key: 'iron', label: 'Iron', goal: 18, unit: 'mg' },
  { key: 'calcium', label: 'Calcium', goal: 1000, unit: 'mg' },
  { key: 'zinc', label: 'Zinc', goal: 11, unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', goal: 400, unit: 'mg' },
];

const SUGAR_DAILY_LIMIT = 50;

interface UserProgressData {
  // Nutrition Data
  totalMealsLogged: number;
  averageDailyCalories: number;
  streakRecord: number;
  goalCompletionRate: number;
  dailyBreakdown: DailyNutritionData[];
  weeklyBreakdown: WeeklyNutritionData[];
  
  // Comprehensive User Data
  achievements: Array<{
    title: string;
    description: string;
    earnedAt: string;
    achievementType: string;
  }>;
  fastingSessions: Array<{
    planName: string;
    startTime: string;
    endTime: string | null;
    status: string;
    actualDuration: number | null;
  }>;
  waterIntakeData: Array<{
    date: string;
    glasses: number;
  }>;
  recipes: Array<{
    name: string;
    servings: number;
    totalCalories: number;
    createdAt: string;
  }>;
  sharedActivities: Array<{
    type: string;
    title: string;
    summary: string;
    note: string | null;
    createdAt: string;
  }>;
  macroAverages: {
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    daysLogged: number;
  };
  fastingTrends: {
    sessions: number;
    completed: number;
    completionRate: number;
    avgHours: number;
    longestHours: number;
    totalHours: number;
  };
  appleHealthToday: {
    steps: number;
    activeCalories: number;
    exerciseMinutes: number | null;
    distanceMiles: number | null;
    workouts: number;
    workoutMinutes: number;
  } | null;
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbGoal: number;
    dailyFatGoal: number;
    dailySugarGoal: number;
    dailyWaterGoal: number;
    createdAt: string;
  };
  monthlyBreakdown: Array<{
    month: string;
    calories: number;
    meals: number;
    goals: number;
    waterGlasses: number;
    fastingSessions: number;
  }>;
}

function asArray(payload: unknown, ...keys: string[]): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of [...keys, 'data', 'sessions', 'achievements']) {
      if (Array.isArray(record[key])) return record[key] as any[];
    }
  }
  return [];
}

function mealCalories(meal: any): number {
  return parseFloat(meal?.totalCalories ?? meal?.calories) || 0;
}

function mealProtein(meal: any): number {
  return parseFloat(meal?.totalProtein ?? meal?.protein) || 0;
}

function mealCarbs(meal: any): number {
  return parseFloat(meal?.totalCarbs ?? meal?.carbs) || 0;
}

function mealFat(meal: any): number {
  return parseFloat(meal?.totalFat ?? meal?.fat) || 0;
}

function mealSugar(meal: any): number {
  return parseFloat(meal?.totalSugar ?? meal?.sugar) || 0;
}

function mealDateKey(meal: any): string {
  const raw = meal?.date ?? meal?.createdAt ?? meal?.created_at ?? '';
  const text = String(raw);
  if (text.includes('T')) return text.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return '';
}

function formatCalories(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} cal`;
}

function formatSharedActivitySummary(type: string, details: Record<string, unknown> | null | undefined): string {
  const d = details || {};
  const num = (key: string) => {
    const value = Number(d[key]);
    return Number.isFinite(value) ? value : null;
  };
  switch (type) {
    case 'summary': {
      if (d.kind === 'fitness') {
        return [
          num('steps') != null ? `${num('steps')!.toLocaleString()} steps` : null,
          num('exerciseMinutes') != null ? `${num('exerciseMinutes')} exercise min` : null,
          num('activeCalories') != null ? `${num('activeCalories')} move cal` : null,
          num('workouts') != null ? `${num('workouts')} workouts` : null,
        ].filter(Boolean).join(' · ');
      }
      return [
        `${num('calories') ?? 0} cal from ${num('meals') ?? 0} meal${num('meals') === 1 ? '' : 's'}`,
        `${num('protein') ?? 0}g protein`,
        `${num('water') ?? 0} glasses of water`,
        d.fast ? `Fast: ${d.fast}` : null,
        num('steps') != null ? `${num('steps')!.toLocaleString()} steps` : null,
        num('exerciseMinutes') != null ? `${num('exerciseMinutes')} exercise min` : null,
        num('activeCalories') != null ? `${num('activeCalories')} move cal` : null,
      ].filter(Boolean).join(' · ');
    }
    case 'meal':
      return [d.mealType, num('calories') != null ? `${num('calories')} cal` : null].filter(Boolean).join(' · ');
    case 'fast':
      return num('hours') != null ? `${num('hours')} hours` : '';
    case 'water':
      return num('glasses') != null ? `${num('glasses')} glasses` : '';
    default:
      return '';
  }
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

// Client-side chart generation using Chart.js
function createChartCanvas(width: number = 600, height: number = 400): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.backgroundColor = 'white';
  return canvas;
}

async function generateWeeklyCaloriesChart(weeklyData: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createChartCanvas(600, 400);
      
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: weeklyData.map(d => `Week ${d.week}`),
          datasets: [{
            label: 'Average Daily Calories',
            data: weeklyData.map(d => d.avgCalories),
            backgroundColor: 'rgba(251, 191, 36, 0.8)', // amber-400 with opacity
            borderColor: '#f59e0b', // amber-500
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              labels: {
                color: '#92400e',
                font: { size: 14, family: 'Arial' }
              }
            },
            title: {
              display: true,
              text: 'Weekly Calorie Intake Progress',
              color: '#78350f',
              font: { size: 18, weight: 'bold', family: 'Arial' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#92400e' },
              grid: { color: 'rgba(146, 64, 14, 0.1)' }
            },
            x: {
              ticks: { color: '#92400e' },
              grid: { color: 'rgba(146, 64, 14, 0.1)' }
            }
          }
        }
      });

      // Wait for chart to render, then convert to base64
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          chart.destroy(); // Clean up
          resolve(dataUrl);
        } catch (error) {
          chart.destroy();
          reject(error);
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

async function generateMacronutrientPieChart(macroData: {carbs: number, protein: number, fat: number}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createChartCanvas(500, 400);
      
      const chart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: ['Carbohydrates', 'Protein', 'Fat'],
          datasets: [{
            data: [macroData.carbs, macroData.protein, macroData.fat],
            backgroundColor: [
              '#fbbf24', // amber-400
              '#f59e0b', // amber-500
              '#d97706', // amber-600
            ],
            borderColor: '#92400e',
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#92400e',
                font: { size: 14, family: 'Arial' },
                usePointStyle: true,
                padding: 20
              }
            },
            title: {
              display: true,
              text: 'Average Daily Macronutrient Breakdown',
              color: '#78350f',
              font: { size: 18, weight: 'bold', family: 'Arial' }
            }
          }
        }
      });

      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          chart.destroy();
          resolve(dataUrl);
        } catch (error) {
          chart.destroy();
          reject(error);
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

async function generateWeightProgressChart(progressData: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createChartCanvas(600, 400);
      
      const chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: progressData.map(d => d.date),
          datasets: [{
            label: 'Calorie Intake Trend',
            data: progressData.map(d => d.calories),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#d97706',
            pointBorderColor: '#92400e',
            pointBorderWidth: 2,
            pointRadius: 6
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              labels: {
                color: '#92400e',
                font: { size: 14, family: 'Arial' }
              }
            },
            title: {
              display: true,
              text: '30-Day Calorie Intake Trend',
              color: '#78350f',
              font: { size: 18, weight: 'bold', family: 'Arial' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#92400e' },
              grid: { color: 'rgba(146, 64, 14, 0.1)' },
              title: {
                display: true,
                text: 'Calories',
                color: '#92400e',
                font: { size: 12, family: 'Arial' }
              }
            },
            x: {
              ticks: { color: '#92400e' },
              grid: { color: 'rgba(146, 64, 14, 0.1)' },
              title: {
                display: true,
                text: 'Date',
                color: '#92400e',
                font: { size: 12, family: 'Arial' }
              }
            }
          }
        }
      });

      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          chart.destroy();
          resolve(dataUrl);
        } catch (error) {
          chart.destroy();
          reject(error);
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

async function generateWaterIntakeChart(waterData: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = createChartCanvas(600, 400);
      
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: waterData.map(d => new Date(d.date).toLocaleDateString()),
          datasets: [{
            label: 'Water Intake (Glasses)',
            data: waterData.map(d => d.glasses || d.amount || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue for water
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              labels: {
                color: '#92400e',
                font: { size: 14, family: 'Arial' }
              }
            },
            title: {
              display: true,
              text: 'Weekly Water Intake',
              color: '#78350f',
              font: { size: 18, weight: 'bold', family: 'Arial' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#92400e' },
              grid: { color: 'rgba(146, 64, 14, 0.1)' },
              title: {
                display: true,
                text: 'Glasses per Day',
                color: '#92400e'
              }
            },
            x: {
              ticks: { color: '#92400e', maxRotation: 45 },
              grid: { color: 'rgba(146, 64, 14, 0.1)' }
            }
          }
        }
      });

      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          chart.destroy();
          resolve(dataUrl);
        } catch (error) {
          chart.destroy();
          reject(error);
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateProgressReportPDF(): Promise<boolean> {
  try {
    // Starting PDF report generation
    // PDF generation started
    
    // Fetch comprehensive user data from database APIs with proper error handling
    let meals: any[] = [];
    let achievements: any[] = [];
    let fastingSessions: any[] = [];
    let waterData: any[] = [];
    let sharedActivitiesRaw: any[] = [];
    let userProfile: any = {};
    const recipes: any[] = []; // No recipe endpoint available, use empty array
    
    try {
      // Fetch meals data - using credentials for session-based auth
      const mealsResponse = await authFetch('/api/meals/logged', {
        credentials: 'include'
      });
      if (mealsResponse.ok) {
        meals = asArray(await mealsResponse.json());
      }
    } catch (error) {
      console.warn('Failed to fetch meals:', error);
    }

    try {
      const activityResponse = await authFetch('/api/activity-feed', {
        credentials: 'include'
      });
      if (activityResponse.ok) {
        const activityPayload = await activityResponse.json();
        sharedActivitiesRaw = asArray(activityPayload, 'myShares', 'activities')
          .filter((activity: any) => activity?.isMine !== false);
      }
    } catch (error) {
      console.warn('Failed to fetch shared activities:', error);
    }
    
    try {
      // Fetch achievements data
      const achievementsResponse = await authFetch('/api/achievements', {
        credentials: 'include'
      });
      if (achievementsResponse.ok) {
        achievements = asArray(await achievementsResponse.json(), 'achievements');
      }
    } catch (error) {
      console.warn('Failed to fetch achievements:', error);
    }
    
    try {
      // Fetch fasting data
      const fastingResponse = await authFetch('/api/fasting/history', {
        credentials: 'include'
      });
      if (fastingResponse.ok) {
        fastingSessions = asArray(await fastingResponse.json(), 'sessions');
      }
    } catch (error) {
      console.warn('Failed to fetch fasting data:', error);
    }
    
    try {
      // Fetch water data
      const waterResponse = await authFetch('/api/water-history?days=90', {
        credentials: 'include'
      });
      if (waterResponse.ok) {
        waterData = asArray(await waterResponse.json(), 'data');
      }
    } catch (error) {
      console.warn('Failed to fetch water data:', error);
    }
    
    try {
      // Fetch user profile
      const userResponse = await authFetch('/api/auth/user', {
        credentials: 'include'
      });
      if (userResponse.ok) {
        userProfile = await userResponse.json() || {};
      }
    } catch (error) {
      console.warn('Failed to fetch user profile:', error);
    }

    let appleHealthToday: UserProgressData['appleHealthToday'] = null;
    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
        const { healthKitService } = await import('@/services/healthKit');
        const summary = await healthKitService.readTodayFitnessSummary();
        if (summary) {
          appleHealthToday = {
            steps: summary.steps,
            activeCalories: summary.activeCalories,
            exerciseMinutes: summary.exerciseMinutes,
            distanceMiles: summary.distanceMiles,
            workouts: summary.workouts?.count ?? 0,
            workoutMinutes: summary.workouts?.minutes ?? 0,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to read Apple Health for PDF:', error);
    }
    
    // Data fetched for PDF generation
    
    // Log sample data to verify structure
    if (meals.length > 0) {
      // Sample meal data available
    }
    if (achievements.length > 0) {
      // Sample achievement data available
    }
    
    // Calculate comprehensive statistics for 30-day period
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Generating charts for data visualization

    // Process data for chart generation
    const weeklyCalorieData = [];
    const macronutrientTotals = { carbs: 0, protein: 0, fat: 0 };
    const dailyCalorieProgress = [];
    const chartWaterData = waterData.slice(-14); // Last 2 weeks for water chart
    
    // Calculate weekly calorie averages for bar chart
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * (week + 1)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekMeals = meals.filter((meal: any) => {
        const mealDate = new Date(meal.date || meal.createdAt);
        return mealDate >= weekStart && mealDate < weekEnd;
      });
      const weekDays = new Set(weekMeals.map(mealDateKey).filter(Boolean)).size;
      const weekCalories = weekMeals.reduce((sum: number, meal: any) => sum + mealCalories(meal), 0);
      const avgCalories = weekDays > 0 ? weekCalories / weekDays : 0;
      
      weeklyCalorieData.push({
        week: 4 - week,
        avgCalories: Math.round(avgCalories)
      });
    }
    
    // Calculate macronutrient totals for pie chart
    meals.forEach((meal: any) => {
      macronutrientTotals.carbs += mealCarbs(meal);
      macronutrientTotals.protein += mealProtein(meal);
      macronutrientTotals.fat += mealFat(meal);
    });
    
    // Create daily progress data for line chart
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(now.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMeals = meals.filter((meal: any) => mealDateKey(meal) === dateStr);
      const totalCalories = dayMeals.reduce((sum: number, meal: any) => sum + mealCalories(meal), 0);
      
      dailyCalorieProgress.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: totalCalories
      });
    }

    // Generate chart images
    // Rendering charts with data
    let weeklyCaloriesChart = '';
    let macronutrientChart = '';
    let progressChart = '';
    let waterChart = '';
    
    try {
      if (weeklyCalorieData.length > 0) {
        weeklyCaloriesChart = await generateWeeklyCaloriesChart(weeklyCalorieData);
        // Weekly calories chart generated
      }
      
      if (macronutrientTotals.carbs + macronutrientTotals.protein + macronutrientTotals.fat > 0) {
        macronutrientChart = await generateMacronutrientPieChart(macronutrientTotals);
        // Macronutrient pie chart generated
      }
      
      if (dailyCalorieProgress.length > 0) {
        progressChart = await generateWeightProgressChart(dailyCalorieProgress);
        // Progress line chart generated
      }
      
      if (chartWaterData.length > 0) {
        waterChart = await generateWaterIntakeChart(chartWaterData);
        // Water intake chart generated
      }
    } catch (chartError) {
      console.warn('⚠️ Chart generation failed, continuing without charts:', chartError);
    }
    
    // Filter recent data from last 30 days
    const recentMeals = meals.filter((meal: any) => {
      const key = mealDateKey(meal);
      if (!key) return false;
      const mealDate = new Date(`${key}T12:00:00`);
      return mealDate >= thirtyDaysAgo && mealDate <= now;
    });
    
    const recentWaterData = waterData.filter((water: any) => {
      const waterDate = new Date(water.date);
      return waterDate >= thirtyDaysAgo && waterDate <= now;
    });
    
    const recentFastingSessions = fastingSessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= thirtyDaysAgo && sessionDate <= now;
    });

    // Generate daily nutrition breakdowns for 30 days
    const dailyBreakdown: DailyNutritionData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      // Filter meals for this specific date
      const dayMeals = recentMeals.filter((meal: any) => mealDateKey(meal) === dateKey);
      
      // Calculate daily totals with proper micronutrient handling
      const dailyData: DailyNutritionData = {
        date: dateKey,
        calories: dayMeals.reduce((sum: number, meal: any) => sum + mealCalories(meal), 0),
        protein: dayMeals.reduce((sum: number, meal: any) => sum + mealProtein(meal), 0),
        carbs: dayMeals.reduce((sum: number, meal: any) => sum + mealCarbs(meal), 0),
        fat: dayMeals.reduce((sum: number, meal: any) => sum + mealFat(meal), 0),
        sugar: dayMeals.reduce((sum: number, meal: any) => sum + mealSugar(meal), 0),
        fiber: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.fiber) || 0), 0),
        sodium: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.sodium) || 0), 0),
        // Handle both camelCase and snake_case micronutrient properties
        vitaminC: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.vitaminC || meal.vitamin_c) || 0), 0),
        vitaminD: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.vitaminD || meal.vitamin_d) || 0), 0),
        vitaminB12: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.vitaminB12 || meal.vitamin_b12) || 0), 0),
        folate: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.folate) || 0), 0),
        iron: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.iron) || 0), 0),
        calcium: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.calcium) || 0), 0),
        zinc: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.zinc) || 0), 0),
        magnesium: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.magnesium) || 0), 0),
        mealsCount: dayMeals.length
      };
      
      dailyBreakdown.push(dailyData);
    }

    // Generate weekly nutrition breakdowns
    const weeklyBreakdown: WeeklyNutritionData[] = [];
    for (let weekIndex = 0; weekIndex < 5; weekIndex++) { // 5 weeks to cover 30+ days
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (weekIndex * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (weekIndex * 7));
      
      const weekStartKey = weekStart.toISOString().split('T')[0];
      const weekEndKey = weekEnd.toISOString().split('T')[0];
      
      // Get daily data for this week
      const weekDays = dailyBreakdown.filter(day => 
        day.date >= weekStartKey && day.date <= weekEndKey
      );
      
      const daysWithData = weekDays.filter(day => day.mealsCount > 0).length;
      const totalMeals = weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.mealsCount, 0);
      
      if (daysWithData > 0) {
        const weekData: WeeklyNutritionData = {
          weekStart: weekStartKey,
          weekEnd: weekEndKey,
          weekNumber: weekIndex + 1,
          avgCalories: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.calories, 0) / daysWithData),
          avgProtein: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.protein, 0) / daysWithData * 10) / 10,
          avgCarbs: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.carbs, 0) / daysWithData * 10) / 10,
          avgFat: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.fat, 0) / daysWithData * 10) / 10,
          avgSugar: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.sugar, 0) / daysWithData * 10) / 10,
          avgFiber: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.fiber, 0) / daysWithData * 10) / 10,
          avgSodium: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.sodium, 0) / daysWithData),
          avgVitaminC: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.vitaminC, 0) / daysWithData * 10) / 10,
          avgVitaminD: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.vitaminD, 0) / daysWithData * 10) / 10,
          avgVitaminB12: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.vitaminB12, 0) / daysWithData * 10) / 10,
          avgFolate: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.folate, 0) / daysWithData * 10) / 10,
          avgIron: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.iron, 0) / daysWithData * 10) / 10,
          avgCalcium: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.calcium, 0) / daysWithData),
          avgZinc: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.zinc, 0) / daysWithData * 10) / 10,
          avgMagnesium: Math.round(weekDays.reduce((sum: number, day: DailyNutritionData) => sum + day.magnesium, 0) / daysWithData),
          totalMeals,
          daysWithData
        };
        weeklyBreakdown.push(weekData);
      }
    }
    
    // Calculate comprehensive monthly breakdown with all user data
    const monthlyData = new Map();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Initialize months with comprehensive tracking
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      monthlyData.set(monthKey, {
        month: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear(),
        calories: 0,
        meals: 0,
        goals: 0,
        waterGlasses: 0,
        fastingSessions: 0
      });
    }
    
    // Process comprehensive monthly data
    recentMeals.forEach((meal: any) => {
      const mealDate = new Date(meal.date || meal.createdAt);
      const monthKey = `${mealDate.getFullYear()}-${mealDate.getMonth()}`;
      
      if (monthlyData.has(monthKey)) {
        const monthStats = monthlyData.get(monthKey);
        monthStats.calories += mealCalories(meal);
        monthStats.meals += 1;
      }
    });
    
    // Process water intake data - handle different possible response formats
    if (Array.isArray(waterData)) {
      waterData.forEach((water: any) => {
        const waterDate = new Date(water.date);
        const monthKey = `${waterDate.getFullYear()}-${waterDate.getMonth()}`;
        
        if (monthlyData.has(monthKey)) {
          const monthStats = monthlyData.get(monthKey);
          monthStats.waterGlasses += water.glasses || water.amount || 0;
        }
      });
    }
    
    // Process fasting sessions - handle different possible response formats
    if (Array.isArray(fastingSessions)) {
      fastingSessions.forEach((session: any) => {
        const sessionDate = new Date(session.startTime || session.createdAt);
        const monthKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
        
        if (monthlyData.has(monthKey)) {
          const monthStats = monthlyData.get(monthKey);
          monthStats.fastingSessions += 1;
        }
      });
    }
    
    // Convert to array and sort by month with comprehensive data
    const monthlyBreakdown = Array.from(monthlyData.values())
      .reverse()
      .map((month: any) => ({
        month: `${month.month} ${month.year}`,
        calories: month.calories,
        meals: month.meals,
        goals: month.goals,
        waterGlasses: month.waterGlasses,
        fastingSessions: month.fastingSessions
      }));
    
    // Calculate comprehensive overall statistics
    const totalMealsLogged = recentMeals.length;
    const totalCalories = recentMeals.reduce((sum: number, meal: any) => sum + mealCalories(meal), 0);
    const daysWithMeals = new Set(recentMeals.map(mealDateKey).filter(Boolean)).size;
    const averageDailyCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
    
    // Calculate streak (simplified)
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDates = Array.from(new Set(recentMeals.map(mealDateKey).filter(Boolean))).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1] as string);
        const currDate = new Date(sortedDates[i] as string);
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    
    // Calculate goal completion rate using user's actual calorie goal
    const userCalorieGoal = userProfile.dailyCalorieGoal || 2000;
    const daysWithGoalMet = dailyBreakdown.filter(day => 
      day.calories >= userCalorieGoal * 0.9 && day.calories <= userCalorieGoal * 1.1 && day.mealsCount > 0
    ).length;
    
    const goalCompletionRate = daysWithMeals > 0 ? Math.round((daysWithGoalMet / daysWithMeals) * 100) : 0;

    const loggedDays = dailyBreakdown.filter(day => day.mealsCount > 0);
    const macroAverages = {
      protein: loggedDays.length
        ? Math.round(loggedDays.reduce((sum, day) => sum + day.protein, 0) / loggedDays.length)
        : 0,
      carbs: loggedDays.length
        ? Math.round(loggedDays.reduce((sum, day) => sum + day.carbs, 0) / loggedDays.length)
        : 0,
      fat: loggedDays.length
        ? Math.round(loggedDays.reduce((sum, day) => sum + day.fat, 0) / loggedDays.length)
        : 0,
      sugar: loggedDays.length
        ? Math.round(loggedDays.reduce((sum, day) => sum + day.sugar, 0) / loggedDays.length)
        : 0,
      daysLogged: loggedDays.length,
    };

    const mappedFastingSessions = recentFastingSessions.map((session: any) => ({
      planName: session.planName || 'Intermittent Fasting',
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status || 'completed',
      actualDuration: session.actualDuration,
    }));
    const completedFasts = mappedFastingSessions.filter(s => String(s.status).toLowerCase() === 'completed');
    const fastHours = (session: { actualDuration: number | null }) =>
      session.actualDuration ? session.actualDuration / (1000 * 60 * 60) : 0;
    const fastingHoursList = mappedFastingSessions.map(fastHours).filter(h => h > 0);
    const fastingTrends = {
      sessions: mappedFastingSessions.length,
      completed: completedFasts.length,
      completionRate: mappedFastingSessions.length
        ? Math.round((completedFasts.length / mappedFastingSessions.length) * 100)
        : 0,
      avgHours: fastingHoursList.length
        ? Math.round((fastingHoursList.reduce((a, b) => a + b, 0) / fastingHoursList.length) * 10) / 10
        : 0,
      longestHours: fastingHoursList.length ? Math.round(Math.max(...fastingHoursList) * 10) / 10 : 0,
      totalHours: Math.round(fastingHoursList.reduce((a, b) => a + b, 0)),
    };
    
    // Gather comprehensive user progress data with all app areas
    const progressData: UserProgressData = {
      // Nutrition Data
      totalMealsLogged,
      averageDailyCalories,
      streakRecord: maxStreak,
      goalCompletionRate,
      dailyBreakdown,
      weeklyBreakdown,
      
      // Comprehensive User Data
      achievements: achievements.map((achievement: any) => ({
        title: achievement.title || 'Achievement Unlocked',
        description: achievement.description || '',
        earnedAt: achievement.earnedAt || achievement.createdAt,
        achievementType: achievement.achievementType || 'general'
      })),
      fastingSessions: mappedFastingSessions,
      waterIntakeData: recentWaterData.map((water: any) => ({
        date: water.date,
        glasses: water.glasses || 0
      })),
      recipes: recipes.map((recipe: any) => ({
        name: recipe.name || 'Custom Recipe',
        servings: recipe.servings || 1,
        totalCalories: recipe.totalCalories || 0,
        createdAt: recipe.createdAt || ''
      })),
      sharedActivities: sharedActivitiesRaw.map((activity: any) => ({
        type: activity.type || 'summary',
        title: activity.title || 'Shared activity',
        summary: formatSharedActivitySummary(activity.type || 'summary', activity.details),
        note: activity.note || null,
        createdAt: activity.createdAt || '',
      })),
      macroAverages,
      fastingTrends,
      appleHealthToday,
      userProfile: {
        firstName: userProfile.firstName || 'ByteWise',
        lastName: userProfile.lastName || 'User',
        email: userProfile.email || '',
        dailyCalorieGoal: userProfile.dailyCalorieGoal || 2000,
        dailyProteinGoal: userProfile.dailyProteinGoal || 180,
        dailyCarbGoal: userProfile.dailyCarbGoal || 200,
        dailyFatGoal: userProfile.dailyFatGoal || 70,
        dailySugarGoal: SUGAR_DAILY_LIMIT,
        dailyWaterGoal: userProfile.dailyWaterGoal || 8,
        createdAt: userProfile.createdAt || ''
      },
      monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : [
        { month: 'No data yet', calories: 0, meals: 0, goals: 0, waterGlasses: 0, fastingSessions: 0 }
      ]
    };

    // Create PDF directly using jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const marginX = 16;
    const contentWidth = pageWidth - marginX * 2;
    const pageBottom = pageHeight - 28;
    let yPosition = 20;

    const startNewPage = () => {
      pdf.addPage();
      yPosition = 20;
    };

    /** Reserve vertical space; starts a new page when the block would overflow. */
    const ensureSpace = (neededMm: number) => {
      if (yPosition + neededMm > pageBottom) startNewPage();
    };

    const writeSectionTitle = (title: string, minSpace = 36) => {
      ensureSpace(minSpace);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14);
      pdf.text(title, marginX, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;
    };

    const writeWrapped = (text: string, x: number, maxWidth: number, lineH = 4.2, reserve = true) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      if (reserve) ensureSpace(lines.length * lineH + 2);
      pdf.text(lines, x, yPosition);
      yPosition += lines.length * lineH;
      return lines.length;
    };

    const addChartBlock = (
      dataUri: string | null | undefined,
      opts: { width: number; height: number; caption?: string },
    ) => {
      if (!dataUri) return;
      const captionH = opts.caption ? 8 : 0;
      ensureSpace(opts.height + captionH + 12);
      if (opts.caption) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(120, 53, 15);
        pdf.text(opts.caption, marginX, yPosition);
        yPosition += 6;
      }
      try {
        pdf.addImage(dataUri, 'PNG', (pageWidth - opts.width) / 2, yPosition, opts.width, opts.height);
        yPosition += opts.height + 10;
      } catch (chartImageError) {
        console.warn('Failed to add chart image:', chartImageError);
      }
      pdf.setTextColor(0, 0, 0);
    };

    // Logo
    try {
      const logoUrl = '/icon-512.png';
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const logoData = reader.result as string;
      const logoWidth = 32;
      const logoHeight = 32;
      pdf.addImage(logoData, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 6;
    } catch (logoError) {
      console.warn('Could not load ByteWise logo for PDF:', logoError);
    }

    // Report Title
    pdf.setTextColor(30, 30, 30);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    const reportName = [progressData.userProfile.firstName, progressData.userProfile.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (reportName && reportName !== 'ByteWise User') {
      pdf.text(reportName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
    }
    pdf.setTextColor(80, 80, 80);
    pdf.setFontSize(14);
    pdf.text('30-Day Nutrition Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated ${new Date().toLocaleDateString()}  ·  ${thirtyDaysAgo.toLocaleDateString()} – ${now.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(0.5);
    pdf.line(marginX + 20, yPosition, pageWidth - marginX - 20, yPosition);
    yPosition += 10;
    pdf.setTextColor(0, 0, 0);

    // Statistics Grid
    writeSectionTitle('Nutrition Summary', 70);
    const stats = [
      { label: 'Meals logged', value: formatCount(progressData.totalMealsLogged), color: [245, 158, 11] as const },
      { label: 'Avg daily calories', value: formatCalories(progressData.averageDailyCalories), color: [217, 119, 6] as const },
      { label: 'Best streak', value: `${formatCount(progressData.streakRecord)} days`, color: [251, 191, 36] as const },
      { label: 'Calorie goal hit', value: `${progressData.goalCompletionRate}%`, color: [245, 158, 11] as const },
      { label: 'Avg sugar / day', value: `${progressData.macroAverages.sugar}g`, color: [217, 119, 6] as const },
      { label: 'Achievements', value: formatCount(progressData.achievements.length), color: [251, 191, 36] as const },
      { label: 'Fasting sessions', value: formatCount(progressData.fastingTrends.sessions), color: [245, 158, 11] as const },
      { label: 'Shared activities', value: formatCount(progressData.sharedActivities.length), color: [217, 119, 6] as const },
    ];

    const cardW = (contentWidth - 6) / 2;
    let col = 0;
    stats.forEach((stat) => {
      if (col === 0) ensureSpace(24);
      const xPos = marginX + col * (cardW + 6);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(xPos, yPosition - 5, cardW, 18, 'F');
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.rect(xPos, yPosition - 5, 2.5, 18, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.text(stat.value, xPos + 6, yPosition + 2);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(70, 70, 70);
      pdf.text(stat.label, xPos + 6, yPosition + 8);
      col += 1;
      if (col >= 2) {
        col = 0;
        yPosition += 22;
      }
    });
    if (col > 0) yPosition += 22;
    yPosition += 6;
    pdf.setTextColor(0, 0, 0);

    // Macros + pie chart kept together
    writeSectionTitle('Daily Macro Averages', 120);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Based on ${progressData.macroAverages.daysLogged} logged day${progressData.macroAverages.daysLogged === 1 ? '' : 's'} in this period.`,
      marginX,
      yPosition,
    );
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const macroRows = [
      { label: 'Protein', avg: progressData.macroAverages.protein, goal: progressData.userProfile.dailyProteinGoal },
      { label: 'Carbs', avg: progressData.macroAverages.carbs, goal: progressData.userProfile.dailyCarbGoal },
      { label: 'Fat', avg: progressData.macroAverages.fat, goal: progressData.userProfile.dailyFatGoal },
      { label: 'Sugar', avg: progressData.macroAverages.sugar, goal: progressData.userProfile.dailySugarGoal },
    ];
    macroRows.forEach((row) => {
      const pct = row.goal > 0 ? Math.round((row.avg / row.goal) * 100) : 0;
      ensureSpace(8);
      writeWrapped(`${row.label}: ${row.avg}g avg  |  goal ${row.goal}g  |  ${pct}% of goal`, marginX + 4, contentWidth - 4, 5);
    });
    yPosition += 2;
    addChartBlock(macronutrientChart, { width: 110, height: 88, caption: 'Macronutrient mix' });

    // Micronutrients (2-column to avoid overflow)
    writeSectionTitle('Essential Micronutrients (Daily Average)', 60);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    let microCol = 0;
    const microColW = contentWidth / 2;
    MICRO_DV.forEach((micro) => {
      const avg = loggedDays.length
        ? loggedDays.reduce((sum, day) => sum + Number(day[micro.key] || 0), 0) / loggedDays.length
        : 0;
      const pct = Math.round((avg / micro.goal) * 100);
      const avgLabel = avg < 10 ? avg.toFixed(1) : String(Math.round(avg));
      const unit = micro.unit === 'μg' ? 'ug' : micro.unit;
      if (microCol === 0) ensureSpace(8);
      const x = marginX + microCol * microColW;
      pdf.text(`${micro.label}: ${avgLabel}${unit} (${pct}% DV)`, x, yPosition);
      microCol += 1;
      if (microCol >= 2) {
        microCol = 0;
        yPosition += 6;
      }
    });
    if (microCol > 0) yPosition += 6;
    yPosition += 6;

    // Weekly averages + weekly calories chart (kept together)
    writeSectionTitle('Weekly Nutrition Averages', 50);
    if (progressData.weeklyBreakdown.length > 0) {
      progressData.weeklyBreakdown.forEach((week, idx) => {
        const weekStartDate = new Date(week.weekStart);
        const weekEndDate = new Date(week.weekEnd);
        const title = `Week ${week.weekNumber}: ${weekStartDate.toLocaleDateString()} – ${weekEndDate.toLocaleDateString()}`;
        const macros = `${formatCalories(week.avgCalories)}  |  P ${week.avgProtein}g  |  C ${week.avgCarbs}g  |  F ${week.avgFat}g  |  Sugar ${week.avgSugar}g  |  Fiber ${week.avgFiber}g  |  Na ${week.avgSodium}mg  |  Meals ${week.totalMeals}`;
        const micros = `Vit C ${week.avgVitaminC}mg  |  Vit D ${week.avgVitaminD}ug  |  B12 ${week.avgVitaminB12}ug  |  Folate ${week.avgFolate}ug  |  Fe ${week.avgIron}mg  |  Ca ${week.avgCalcium}mg  |  Zn ${week.avgZinc}mg  |  Mg ${week.avgMagnesium}mg`;
        pdf.setFontSize(10);
        const titleLines = pdf.splitTextToSize(title, contentWidth).length;
        pdf.setFontSize(8);
        const blockH = titleLines * 5 + pdf.splitTextToSize(macros, contentWidth - 2).length * 4
          + pdf.splitTextToSize(micros, contentWidth - 2).length * 4 + 6;
        ensureSpace(blockH);
        const blockTop = yPosition - 3;
        if (idx % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(marginX - 2, blockTop, contentWidth + 4, blockH, 'F');
        }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14);
        writeWrapped(title, marginX, contentWidth, 5, false);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        writeWrapped(macros, marginX + 2, contentWidth - 2, 4, false);
        writeWrapped(micros, marginX + 2, contentWidth - 2, 4, false);
        yPosition += 4;
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      writeWrapped('No weekly data available for the selected period.', marginX, contentWidth);
      yPosition += 4;
    }
    addChartBlock(weeklyCaloriesChart, { width: 150, height: 95, caption: 'Weekly calorie averages' });

    // Daily details + progress chart
    writeSectionTitle('Daily Nutrition Details', 50);
    const filteredDays = progressData.dailyBreakdown.filter((day) => day.mealsCount > 0);
    if (filteredDays.length > 0) {
      filteredDays.forEach((day, idx) => {
        ensureSpace(18);
        if (idx % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(marginX - 2, yPosition - 3, contentWidth + 4, 14, 'F');
        }
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14);
        const dayDate = new Date(day.date);
        pdf.text(`${dayDate.toLocaleDateString()} (${day.mealsCount} meals)`, marginX, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        writeWrapped(
          `${formatCalories(day.calories)}  |  P ${day.protein.toFixed(0)}g  |  C ${day.carbs.toFixed(0)}g  |  F ${day.fat.toFixed(0)}g  |  Sugar ${day.sugar.toFixed(0)}g`,
          marginX + 2,
          contentWidth - 2,
          3.8,
        );
        const microText: string[] = [];
        if (day.fiber > 0) microText.push(`Fiber ${day.fiber.toFixed(0)}g`);
        if (day.vitaminC > 0) microText.push(`Vit C ${day.vitaminC.toFixed(1)}mg`);
        if (day.vitaminD > 0) microText.push(`Vit D ${day.vitaminD.toFixed(1)}ug`);
        if (day.vitaminB12 > 0) microText.push(`B12 ${day.vitaminB12.toFixed(1)}ug`);
        if (day.folate > 0) microText.push(`Folate ${day.folate.toFixed(0)}ug`);
        if (day.iron > 0) microText.push(`Fe ${day.iron.toFixed(1)}mg`);
        if (day.calcium > 0) microText.push(`Ca ${day.calcium.toFixed(0)}mg`);
        if (day.zinc > 0) microText.push(`Zn ${day.zinc.toFixed(1)}mg`);
        if (day.magnesium > 0) microText.push(`Mg ${day.magnesium.toFixed(0)}mg`);
        if (day.sodium > 0) microText.push(`Na ${day.sodium.toFixed(0)}mg`);
        if (microText.length > 0) {
          writeWrapped(microText.join('  |  '), marginX + 2, contentWidth - 2, 3.8);
        }
        yPosition += 3;
      });
    } else {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      writeWrapped('No daily nutrition data available for the selected period.', marginX, contentWidth);
    }
    addChartBlock(progressChart, { width: 150, height: 95, caption: 'Daily calorie progress' });

    // Achievements
    if (progressData.achievements.length > 0) {
      writeSectionTitle('Achievements Earned', 40);
      progressData.achievements.slice(0, 5).forEach((achievement) => {
        ensureSpace(20);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6);
        writeWrapped(achievement.title, marginX + 4, contentWidth - 4, 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        if (achievement.description) {
          writeWrapped(
            achievement.description.length > 100
              ? `${achievement.description.slice(0, 97)}...`
              : achievement.description,
            marginX + 6,
            contentWidth - 6,
            4,
          );
        }
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Earned: ${new Date(achievement.earnedAt).toLocaleDateString()}`, marginX + 6, yPosition);
        yPosition += 8;
      });
      if (progressData.achievements.length > 5) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        writeWrapped(`... and ${progressData.achievements.length - 5} more achievements`, marginX + 4, contentWidth - 4);
        yPosition += 4;
      }
    }

    // Water + chart together
    if (progressData.waterIntakeData.length > 0 || waterChart) {
      writeSectionTitle('Water Intake', 50);
      if (progressData.waterIntakeData.length > 0) {
        const totalWaterGlasses = progressData.waterIntakeData.reduce((sum, day) => sum + day.glasses, 0);
        const avgDailyWater = Math.round(totalWaterGlasses / Math.max(1, progressData.waterIntakeData.length));
        const goalWater = progressData.userProfile.dailyWaterGoal || 8;
        const waterGoalRate = Math.round((avgDailyWater / goalWater) * 100);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        writeWrapped(`Total: ${formatCount(totalWaterGlasses)} glasses`, marginX + 4, contentWidth - 4, 5);
        writeWrapped(`Daily average: ${formatCount(avgDailyWater)} glasses (goal ${goalWater})`, marginX + 4, contentWidth - 4, 5);
        writeWrapped(`Goal achievement: ${waterGoalRate}%`, marginX + 4, contentWidth - 4, 5);
        yPosition += 2;
      }
      addChartBlock(waterChart, { width: 150, height: 95, caption: 'Weekly water intake' });
    }

    // Fasting
    if (progressData.fastingSessions.length > 0 || progressData.fastingTrends.sessions > 0) {
      writeSectionTitle('Intermittent Fasting Trends', 50);
      const trends = progressData.fastingTrends;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      writeWrapped(`Total sessions: ${formatCount(trends.sessions)}`, marginX + 4, contentWidth - 4, 5);
      writeWrapped(`Goals completed: ${formatCount(trends.completed)} (${trends.completionRate}%)`, marginX + 4, contentWidth - 4, 5);
      writeWrapped(`Average fast: ${trends.avgHours}h  |  Longest: ${trends.longestHours}h`, marginX + 4, contentWidth - 4, 5);
      writeWrapped(`Total fasting time: ${formatCount(trends.totalHours)} hours`, marginX + 4, contentWidth - 4, 5);
      yPosition += 4;
    }

    // Apple Health
    if (progressData.appleHealthToday) {
      writeSectionTitle('Apple Health (Today)', 45);
      const health = progressData.appleHealthToday;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      writeWrapped(`Steps: ${health.steps.toLocaleString()}  |  Move calories: ${health.activeCalories}`, marginX + 4, contentWidth - 4, 5);
      const extras: string[] = [];
      if (health.exerciseMinutes != null) extras.push(`Exercise ${health.exerciseMinutes} min`);
      if (health.distanceMiles != null) extras.push(`${health.distanceMiles} mi`);
      if (health.workouts > 0) {
        extras.push(`Workouts ${health.workouts}${health.workoutMinutes ? ` (${health.workoutMinutes} min)` : ''}`);
      }
      if (extras.length) writeWrapped(extras.join('  |  '), marginX + 4, contentWidth - 4, 5);
      yPosition += 4;
    }

    // Shared activities
    writeSectionTitle('Shared Activity Summaries', 40);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    writeWrapped('Posts you shared with friends and family in Bytewise.', marginX, contentWidth, 4);
    yPosition += 2;
    if (progressData.sharedActivities.length === 0) {
      pdf.setFontSize(10);
      writeWrapped('No shared activity summaries yet.', marginX + 4, contentWidth - 4);
      yPosition += 4;
    } else {
      progressData.sharedActivities.forEach((activity, idx) => {
        ensureSpace(24);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6);
        writeWrapped(`${idx + 1}. ${activity.title}`, marginX + 4, contentWidth - 4, 4.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        if (activity.summary) writeWrapped(activity.summary, marginX + 6, contentWidth - 6, 3.8);
        if (activity.note) {
          pdf.setTextColor(55, 65, 81);
          writeWrapped(`Note: "${activity.note}"`, marginX + 6, contentWidth - 6, 3.8);
        }
        pdf.setTextColor(100, 100, 100);
        const when = activity.createdAt
          ? new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Date unavailable';
        writeWrapped(`${activity.type} · ${when}`, marginX + 6, contentWidth - 6, 4);
        yPosition += 4;
      });
    }

    // Recipes
    if (progressData.recipes.length > 0) {
      writeSectionTitle('Custom Recipes', 35);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      writeWrapped(`Recipes created: ${formatCount(progressData.recipes.length)}`, marginX + 4, contentWidth - 4, 5);
      progressData.recipes.slice(0, 3).forEach((recipe, idx) => {
        ensureSpace(14);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6);
        writeWrapped(`${idx + 1}. ${recipe.name}`, marginX + 6, contentWidth - 6, 4);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        writeWrapped(`${formatCalories(recipe.totalCalories)}  ·  ${recipe.servings} servings`, marginX + 8, contentWidth - 8, 4);
      });
      if (progressData.recipes.length > 3) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        writeWrapped(`... and ${progressData.recipes.length - 3} more recipes`, marginX + 6, contentWidth - 6);
      }
    }

    // Footers on every page
    const totalPages = pdf.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      pdf.setPage(page);
      const footerY = pageHeight - 14;
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.3);
      pdf.line(marginX + 10, footerY - 6, pageWidth - marginX - 10, footerY - 6);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14);
      pdf.text('ByteWise Nutritionist', pageWidth / 2, footerY, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(140, 140, 140);
      pdf.text(`${page} / ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
    }

    // Save the comprehensive PDF with single download method
    const filename = `bytewise-30day-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('💾 Saving PDF with filename:', filename);
    
    try {
      await savePdf(pdf, filename);
      console.log('✅ PDF download initiated successfully');
      
      return true;
      
    } catch (downloadError) {
      console.error('❌ PDF Generation: Download failed:', downloadError);
      throw downloadError;
    }

  } catch (error: any) {
    console.error('💥 PDF generation failed:', error);
    console.error('📋 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    throw error; // Re-throw to let the UI handle the error display
  }
}

/** Browser download on the web; on iOS/Android the web view can't download, so write the file and open the share sheet. */
async function savePdf(pdf: jsPDF, filename: string): Promise<void> {
  const capture = (globalThis as any).__BYTEWISE_PDF_CAPTURE;
  if (capture && typeof capture === 'object') {
    capture.filename = filename;
    capture.dataUri = pdf.output('datauristring');
    capture.pages = pdf.getNumberOfPages();
    return;
  }

  if (!Capacitor.isNativePlatform()) {
    pdf.save(filename);
    return;
  }

  const base64 = pdf.output('datauristring').split(',')[1];
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({
      title: 'Bytewise Nutrition Report',
      url: uri,
      dialogTitle: 'Save or share your report',
    });
  } catch (error: any) {
    if (!/cancel/i.test(String(error?.message ?? error))) {
      throw error;
    }
  }
}
