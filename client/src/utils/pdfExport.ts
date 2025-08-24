/**
 * ByteWise Nutritionist PDF Export Utility
 * 
 * Creates comprehensive PDF reports with nutrition data, achievements, 
 * fasting sessions, water intake, and personal progress insights
 * Features yellow/amber styling to match app branding
 */

import { jsPDF } from 'jspdf';
import { apiRequest } from '@/lib/queryClient';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface DailyNutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    dailyCalorieGoal: number;
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
    let userProfile: any = {};
    const recipes: any[] = []; // No recipe endpoint available, use empty array
    
    try {
      // Fetch meals data - using credentials for session-based auth
      const mealsResponse = await fetch('/api/meals/logged', {
        credentials: 'include'
      });
      if (mealsResponse.ok) {
        meals = await mealsResponse.json() || [];
      }
    } catch (error) {
      console.warn('Failed to fetch meals:', error);
    }
    
    try {
      // Fetch achievements data
      const achievementsResponse = await fetch('/api/achievements', {
        credentials: 'include'
      });
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        achievements = achievementsData?.achievements || [];
      }
    } catch (error) {
      console.warn('Failed to fetch achievements:', error);
    }
    
    try {
      // Fetch fasting data
      const fastingResponse = await fetch('/api/fasting/history', {
        credentials: 'include'
      });
      if (fastingResponse.ok) {
        const fastingData = await fastingResponse.json();
        fastingSessions = fastingData?.sessions || [];
      }
    } catch (error) {
      console.warn('Failed to fetch fasting data:', error);
    }
    
    try {
      // Fetch water data
      const waterResponse = await fetch('/api/water-history?days=90', {
        credentials: 'include'
      });
      if (waterResponse.ok) {
        waterData = await waterResponse.json() || [];
      }
    } catch (error) {
      console.warn('Failed to fetch water data:', error);
    }
    
    try {
      // Fetch user profile
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      if (userResponse.ok) {
        userProfile = await userResponse.json() || {};
      }
    } catch (error) {
      console.warn('Failed to fetch user profile:', error);
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
      
      const avgCalories = weekMeals.length > 0 
        ? weekMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0) / Math.max(1, weekMeals.length)
        : 0;
      
      weeklyCalorieData.push({
        week: 4 - week,
        avgCalories: Math.round(avgCalories)
      });
    }
    
    // Calculate macronutrient totals for pie chart
    meals.forEach((meal: any) => {
      macronutrientTotals.carbs += meal.carbs || 0;
      macronutrientTotals.protein += meal.protein || 0;
      macronutrientTotals.fat += meal.fat || 0;
    });
    
    // Create daily progress data for line chart
    for (let day = 29; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(now.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMeals = meals.filter((meal: any) => {
        const mealDate = new Date(meal.date || meal.createdAt);
        return mealDate.toISOString().split('T')[0] === dateStr;
      });
      
      const totalCalories = dayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
      
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
      const mealDate = new Date(meal.date || meal.createdAt);
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
      const dayMeals = recentMeals.filter((meal: any) => {
        let mealDateKey;
        if (meal.date && meal.date.includes('T')) {
          mealDateKey = meal.date.split('T')[0];
        } else {
          mealDateKey = meal.date;
        }
        return mealDateKey === dateKey;
      });
      
      // Calculate daily totals with proper micronutrient handling
      const dailyData: DailyNutritionData = {
        date: dateKey,
        calories: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.totalCalories || meal.calories) || 0), 0),
        protein: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.totalProtein || meal.protein) || 0), 0),
        carbs: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.totalCarbs || meal.carbs) || 0), 0),
        fat: dayMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.totalFat || meal.fat) || 0), 0),
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
        monthStats.calories += parseFloat(meal.totalCalories || meal.calories) || 0;
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
    const totalCalories = recentMeals.reduce((sum: number, meal: any) => sum + (parseFloat(meal.totalCalories || meal.calories) || 0), 0);
    const daysWithMeals = new Set(recentMeals.map((meal: any) => meal.date || meal.createdAt?.split('T')[0])).size;
    const averageDailyCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
    
    // Calculate streak (simplified)
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDates = Array.from(new Set(recentMeals.map((meal: any) => meal.date || meal.createdAt?.split('T')[0]))).sort();
    
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
      fastingSessions: recentFastingSessions.map((session: any) => ({
        planName: session.planName || 'Intermittent Fasting',
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status || 'completed',
        actualDuration: session.actualDuration
      })),
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
      userProfile: {
        firstName: userProfile.firstName || 'ByteWise',
        lastName: userProfile.lastName || 'User',
        email: userProfile.email || '',
        dailyCalorieGoal: userProfile.dailyCalorieGoal || 2000,
        dailyWaterGoal: userProfile.dailyWaterGoal || 8,
        createdAt: userProfile.createdAt || ''
      },
      monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : [
        { month: 'No data yet', calories: 0, meals: 0, goals: 0, waterGlasses: 0, fastingSessions: 0 }
      ]
    };

    // Create PDF directly using jsPDF
    
    // jsPDF library loaded
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = 210;
    const pageHeight = 297;
    let yPosition = 25;

    // Add ByteWise Nutritionist logo
    try {
      // Fetch and convert the logo to base64
      const logoUrl = '/icon-512.png'; // High quality ByteWise logo
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const logoData = reader.result as string;
      
      // Add logo to PDF (centered, 40mm width for better visibility)
      const logoWidth = 40;
      const logoHeight = 40;
      const logoX = (pageWidth - logoWidth) / 2;
      
      pdf.addImage(logoData, 'PNG', logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 5;
    } catch (logoError) {
      // If logo fails to load, continue without it
      console.warn('Could not load ByteWise logo for PDF:', logoError);
    }

    // Report Title
    yPosition += 12;
    pdf.setTextColor(100, 100, 100); // Gray for subtitle
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('30-Day Comprehensive Nutrition Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    pdf.setFontSize(10);
    pdf.text(`Report Period: ${thirtyDaysAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Add a decorative line - updated to amber theme
    yPosition += 10;
    pdf.setDrawColor(245, 158, 11); // Amber-500 color
    pdf.setLineWidth(0.5);
    pdf.line(40, yPosition, pageWidth - 40, yPosition);
    
    yPosition += 15;
    
    // Reset text color to black for content
    pdf.setTextColor(0, 0, 0);

    // Statistics Grid - Updated with amber theme
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
    pdf.text('Nutrition Summary', 20, yPosition);
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition += 15;

    const stats = [
      { label: 'Total Meals Logged', value: progressData.totalMealsLogged.toString(), color: [245, 158, 11] }, // Amber-500
      { label: 'Average Daily Calories', value: progressData.averageDailyCalories.toString(), color: [217, 119, 6] }, // Amber-600
      { label: 'Best Streak (days)', value: progressData.streakRecord.toString(), color: [251, 191, 36] }, // Amber-400
      { label: 'Goal Completion Rate', value: `${progressData.goalCompletionRate}%`, color: [245, 158, 11] }, // Amber-500
      { label: 'Achievements Earned', value: progressData.achievements.length.toString(), color: [217, 119, 6] }, // Amber-600
      { label: 'Total Calories Tracked', value: `${Math.round(progressData.monthlyBreakdown.reduce((sum, m) => sum + m.calories, 0) / 1000)}k`, color: [251, 191, 36] } // Amber-400
    ];

    pdf.setFontSize(12);
    
    let col = 0;
    const colWidth = 90;
    const startX = 20;
    
    stats.forEach((stat, index) => {
      const xPos = startX + (col * colWidth);
      
      // Draw a clean rectangular background with rounded corners effect
      pdf.setFillColor(250, 250, 250); // Light gray background
      pdf.rect(xPos - 2, yPosition - 6, 85, 14, 'F');
      
      // Add colored accent bar
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.rect(xPos - 2, yPosition - 6, 3, 14, 'F');
      
      // Value in dark color
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.text(stat.value, xPos + 5, yPosition);
      
      // Label in clean dark text
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(stat.label, xPos + 5, yPosition + 10);
      
      col++;
      if (col >= 2) {
        col = 0;
        yPosition += 26;
      }
    });

    if (col > 0) yPosition += 25;
    yPosition += 10;
    
    // Reset text color for content
    pdf.setTextColor(0, 0, 0);

    // Check if we need a new page for the detailed breakdowns
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 25;
    }

    // Weekly Nutrition Summary - Updated with amber theme
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
    pdf.text('Weekly Nutrition Averages (Last 30 Days)', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    if (progressData.weeklyBreakdown.length > 0) {
      progressData.weeklyBreakdown.forEach((week, idx) => {
        // Week header with background
        if (idx % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14); // Amber-800 for week headers
        const weekStartDate = new Date(week.weekStart);
        const weekEndDate = new Date(week.weekEnd);
        pdf.text(`Week ${week.weekNumber}: ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`, 20, yPosition);
        
        yPosition += 8;
        
        // Macros row
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        pdf.text(`Calories: ${week.avgCalories}`, 25, yPosition);
        pdf.text(`Protein: ${week.avgProtein}g`, 75, yPosition);
        pdf.text(`Carbs: ${week.avgCarbs}g`, 125, yPosition);
        pdf.text(`Fat: ${week.avgFat}g`, 175, yPosition);
        
        yPosition += 7;
        
        // Micronutrients row
        pdf.text(`Fiber: ${week.avgFiber}g`, 25, yPosition);
        pdf.text(`Sodium: ${week.avgSodium}mg`, 75, yPosition);
        pdf.text(`Vit C: ${week.avgVitaminC}mg`, 125, yPosition);
        pdf.text(`Iron: ${week.avgIron}mg`, 175, yPosition);
        
        yPosition += 7;
        
        // Additional nutrients row
        pdf.text(`Calcium: ${week.avgCalcium}mg`, 25, yPosition);
        pdf.text(`Zinc: ${week.avgZinc}mg`, 75, yPosition);
        pdf.text(`Magnesium: ${week.avgMagnesium}mg`, 125, yPosition);
        pdf.text(`Meals: ${week.totalMeals}`, 175, yPosition);
        
        yPosition += 15;
        
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 25;
        }
      });
    } else {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No weekly data available for the selected period.', 20, yPosition);
      yPosition += 15;
    }

    yPosition += 10;

    // Check if we need a new page for daily breakdown
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 25;
    }

    // Daily Nutrition Breakdown - Updated with amber theme
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
    pdf.text('Daily Nutrition Details (Last 30 Days)', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    // Filter out days with no meals for cleaner display
    const filteredDays = progressData.dailyBreakdown.filter(day => day.mealsCount > 0);
    
    if (filteredDays.length > 0) {
      filteredDays.forEach((day, idx) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 25;
        }
        
        // Day header with background
        if (idx % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(15, yPosition - 3, pageWidth - 30, 20, 'F');
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(146, 64, 14); // Amber-800 for day headers
        const dayDate = new Date(day.date);
        pdf.text(`${dayDate.toLocaleDateString()} (${day.mealsCount} meals)`, 20, yPosition);
        
        yPosition += 6;
        
        // Nutrition data in compact format
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        
        // Row 1: Main macros
        pdf.text(`${day.calories} cal`, 25, yPosition);
        pdf.text(`P: ${day.protein.toFixed(1)}g`, 65, yPosition);
        pdf.text(`C: ${day.carbs.toFixed(1)}g`, 95, yPosition);
        pdf.text(`F: ${day.fat.toFixed(1)}g`, 125, yPosition);
        pdf.text(`Fiber: ${day.fiber.toFixed(1)}g`, 155, yPosition);
        
        yPosition += 5;
        
        // Row 2: Key micronutrients (only show if > 0)
        let microText = [];
        if (day.vitaminC > 0) microText.push(`Vit C: ${day.vitaminC.toFixed(1)}mg`);
        if (day.iron > 0) microText.push(`Iron: ${day.iron.toFixed(1)}mg`);
        if (day.calcium > 0) microText.push(`Ca: ${day.calcium.toFixed(0)}mg`);
        if (day.sodium > 0) microText.push(`Na: ${day.sodium.toFixed(0)}mg`);
        
        if (microText.length > 0) {
          pdf.text(microText.join('  •  '), 25, yPosition);
          yPosition += 5;
        }
        
        yPosition += 5;
      });
    } else {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No daily nutrition data available for the selected period.', 20, yPosition);
      yPosition += 15;
    }

    yPosition += 20;

    // Add comprehensive user data sections
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 25;
    }

    // Achievements Section
    if (progressData.achievements.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
      pdf.text('Achievements Earned', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      progressData.achievements.slice(0, 5).forEach((achievement, idx) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6); // Amber-600
        pdf.text(`Achievement: ${achievement.title}`, 25, yPosition);
        
        yPosition += 6;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        if (achievement.description && achievement.description.length > 0) {
          pdf.text(achievement.description.substring(0, 80) + (achievement.description.length > 80 ? '...' : ''), 30, yPosition);
          yPosition += 5;
        }
        
        const earnedDate = new Date(achievement.earnedAt);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Earned: ${earnedDate.toLocaleDateString()}`, 30, yPosition);
        yPosition += 10;
        
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 25;
        }
      });

      if (progressData.achievements.length > 5) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`... and ${progressData.achievements.length - 5} more achievements!`, 25, yPosition);
        yPosition += 15;
      }
    }

    // Water Intake Section
    if (progressData.waterIntakeData.length > 0 && yPosition < 220) {
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
      pdf.text('Water Intake Summary', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      const totalWaterGlasses = progressData.waterIntakeData.reduce((sum, day) => sum + day.glasses, 0);
      const avgDailyWater = Math.round(totalWaterGlasses / Math.max(1, progressData.waterIntakeData.length));
      const goalWater = progressData.userProfile.dailyWaterGoal || 8;

      pdf.setFontSize(12);
      pdf.text(`💧 Total Water: ${totalWaterGlasses} glasses`, 25, yPosition);
      yPosition += 8;
      pdf.text(`📊 Daily Average: ${avgDailyWater} glasses (Goal: ${goalWater})`, 25, yPosition);
      yPosition += 8;
      
      const waterGoalRate = Math.round((avgDailyWater / goalWater) * 100);
      pdf.text(`🎯 Goal Achievement: ${waterGoalRate}%`, 25, yPosition);
      yPosition += 15;
    }

    // Fasting Sessions Section
    if (progressData.fastingSessions.length > 0 && yPosition < 200) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
      pdf.text('Intermittent Fasting', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      const completedSessions = progressData.fastingSessions.filter(s => s.status === 'completed');
      const totalFastingHours = completedSessions.reduce((sum, session) => {
        return sum + (session.actualDuration ? Math.round(session.actualDuration / (1000 * 60 * 60)) : 0);
      }, 0);

      pdf.setFontSize(12);
      pdf.text(`⏰ Total Sessions: ${progressData.fastingSessions.length}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`✅ Completed: ${completedSessions.length}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`🕐 Total Fasting Time: ${totalFastingHours} hours`, 25, yPosition);
      yPosition += 15;
    }

    // Custom Recipes Section
    if (progressData.recipes.length > 0 && yPosition < 180) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(146, 64, 14); // Amber-800 for section headers
      pdf.text('Custom Recipes', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.text(`🍳 Total Recipes Created: ${progressData.recipes.length}`, 25, yPosition);
      yPosition += 10;

      // Show top 3 recipes
      progressData.recipes.slice(0, 3).forEach((recipe, idx) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 25;
        }
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6); // Amber-600
        pdf.text(`${idx + 1}. ${recipe.name}`, 30, yPosition);
        
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${recipe.totalCalories} cal • ${recipe.servings} servings`, 35, yPosition);
        yPosition += 8;
      });

      if (progressData.recipes.length > 3) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`... and ${progressData.recipes.length - 3} more recipes`, 30, yPosition);
        yPosition += 10;
      }
    }

    // Data Visualization Section - Charts
    if (weeklyCaloriesChart || macronutrientChart || progressChart || waterChart) {
      // Adding charts to PDF
      
      // Add new page for charts
      pdf.addPage();
      yPosition = 20;
      
      // Charts section header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(120, 53, 15); // amber-800
      pdf.text('Weekly Progress Analytics', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(146, 64, 14); // amber-700
      pdf.text('Visual analysis of your nutrition and health data', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      
      // Weekly Calories Bar Chart
      if (weeklyCaloriesChart) {
        try {
          const chartWidth = 160;
          const chartHeight = 106;
          
          pdf.addImage(
            weeklyCaloriesChart, 
            'PNG', 
            (pageWidth - chartWidth) / 2, 
            yPosition, 
            chartWidth, 
            chartHeight
          );
          yPosition += chartHeight + 15;
          
          // Weekly calories chart added
        } catch (chartImageError) {
          console.warn('Failed to add weekly calories chart:', chartImageError);
        }
      }
      
      // Macronutrient Pie Chart
      if (macronutrientChart && yPosition < 200) {
        try {
          const chartWidth = 133;
          const chartHeight = 106;
          
          pdf.addImage(
            macronutrientChart, 
            'PNG', 
            (pageWidth - chartWidth) / 2, 
            yPosition, 
            chartWidth, 
            chartHeight
          );
          yPosition += chartHeight + 15;
          
          // Macronutrient pie chart added
        } catch (chartImageError) {
          console.warn('Failed to add macronutrient chart:', chartImageError);
        }
      }
      
      // Add new page if needed for remaining charts
      if (yPosition > 180 && (progressChart || waterChart)) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Progress Line Chart
      if (progressChart) {
        try {
          const chartWidth = 160;
          const chartHeight = 106;
          
          pdf.addImage(
            progressChart, 
            'PNG', 
            (pageWidth - chartWidth) / 2, 
            yPosition, 
            chartWidth, 
            chartHeight
          );
          yPosition += chartHeight + 15;
          
          console.log('✅ Progress line chart added');
        } catch (chartImageError) {
          console.warn('Failed to add progress chart:', chartImageError);
        }
      }
      
      // Water Intake Chart
      if (waterChart && yPosition < 200) {
        try {
          const chartWidth = 160;
          const chartHeight = 106;
          
          pdf.addImage(
            waterChart, 
            'PNG', 
            (pageWidth - chartWidth) / 2, 
            yPosition, 
            chartWidth, 
            chartHeight
          );
          yPosition += chartHeight + 10;
          
          console.log('✅ Water intake chart added');
        } catch (chartImageError) {
          console.warn('Failed to add water intake chart:', chartImageError);
        }
      }
      
      console.log('📊 All charts added to PDF successfully');
    }

    yPosition += 20;

    // Footer with branding
    yPosition = pageHeight - 30;
    
    // Add footer line with amber theme
    pdf.setDrawColor(245, 158, 11); // Amber-500 
    pdf.setLineWidth(0.3);
    pdf.line(40, yPosition, pageWidth - 40, yPosition);
    
    yPosition += 8;
    
    // Footer text with amber brand colors
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(146, 64, 14); // Amber-800
    pdf.text('ByteWise', pageWidth / 2 - 20, yPosition, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(217, 119, 6); // Amber-600
    pdf.text('Nutritionist', pageWidth / 2 + 20, yPosition, { align: 'center' });
    
    yPosition += 6;
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your Personal Nutrition Companion', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 5;
    pdf.text('Your comprehensive 30-day nutrition analysis!', pageWidth / 2, yPosition, { align: 'center' });

    // Save the comprehensive PDF with single download method
    const filename = `bytewise-30day-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('💾 Saving PDF with filename:', filename);
    
    try {
      // Use direct jsPDF save - single, reliable method
      console.log('💾 Generating and downloading PDF...');
      pdf.save(filename);
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
