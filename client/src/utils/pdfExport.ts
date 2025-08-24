/**
 * ByteWise Nutritionist PDF Export Utility
 * 
 * Creates comprehensive PDF reports with nutrition data, achievements, 
 * fasting sessions, water intake, and personal progress insights
 * Features yellow/amber styling to match app branding
 */

import { jsPDF } from 'jspdf';
import { apiRequest } from '@/lib/queryClient';

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

export async function generateProgressReportPDF(): Promise<boolean> {
  try {
    console.log('🔄 Starting comprehensive PDF report generation...');
    
    // Fetch comprehensive user data from database APIs
    const [
      mealsResponse,
      achievementsResponse, 
      fastingResponse,
      waterResponse,
      recipesResponse,
      userResponse,
      dailyStatsResponse
    ] = await Promise.all([
      apiRequest('/api/meals/logged'),
      apiRequest('/api/achievements'), 
      apiRequest('/api/fasting/sessions'),
      apiRequest('/api/water-intake?days=90'), // Get 3 months of water data
      apiRequest('/api/recipes'),
      apiRequest('/api/user/profile'),
      apiRequest('/api/daily-stats')
    ]);
    
    const meals = mealsResponse || [];
    const achievements = achievementsResponse?.achievements || [];
    const fastingSessions = fastingResponse?.sessions || [];
    const waterData = waterResponse?.waterIntake || [];
    const recipes = recipesResponse?.recipes || [];
    const userProfile = userResponse || {};
    const dailyStats = dailyStatsResponse || {};
    
    console.log('📊 Data fetched:', { 
      meals: meals.length, 
      achievements: achievements.length,
      fastingSessions: fastingSessions.length,
      waterData: waterData.length,
      recipes: recipes.length 
    });
    
    // Calculate comprehensive statistics for 30-day period
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
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
    
    // Process water intake data
    recentWaterData.forEach((water: any) => {
      const waterDate = new Date(water.date);
      const monthKey = `${waterDate.getFullYear()}-${waterDate.getMonth()}`;
      
      if (monthlyData.has(monthKey)) {
        const monthStats = monthlyData.get(monthKey);
        monthStats.waterGlasses += water.glasses || 0;
      }
    });
    
    // Process fasting sessions
    recentFastingSessions.forEach((session: any) => {
      const sessionDate = new Date(session.startTime);
      const monthKey = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
      
      if (monthlyData.has(monthKey)) {
        const monthStats = monthlyData.get(monthKey);
        monthStats.fastingSessions += 1;
      }
    });
    
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
    
    console.log('jsPDF available:', typeof jsPDF);
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
      
      // Draw a small colored rectangle as background
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
      pdf.rect(xPos - 2, yPosition - 5, 40, 12, 'F');
      
      // Value in white on colored background
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(stat.value, xPos + 18, yPosition, { align: 'center' });
      
      // Label in gray below
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(stat.label, xPos, yPosition + 10);
      
      col++;
      if (col >= 2) {
        col = 0;
        yPosition += 25;
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
        pdf.text(`🏆 ${achievement.title}`, 25, yPosition);
        
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

    // Save the comprehensive PDF with proper download functionality
    const filename = `bytewise-30day-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    
    
    try {
      // Create PDF blob first for better control
      const pdfBlob = pdf.output('blob');
      
      
      if (pdfBlob.size === 0) {
        throw new Error('PDF blob is empty');
      }
      
      // Method 1: Direct jsPDF save (most reliable)
      
      pdf.save(filename);
      
      
      // Method 2: Blob download with user gesture (more compatible)
      
      const url = URL.createObjectURL(pdfBlob);
      
      // Create download link with proper attributes
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.target = '_blank';
      downloadLink.style.position = 'absolute';
      downloadLink.style.left = '-9999px';
      downloadLink.setAttribute('role', 'button');
      downloadLink.setAttribute('aria-label', 'Download PDF Report');
      
      // Add to DOM and trigger
      document.body.appendChild(downloadLink);
      
      // Use both click methods for maximum compatibility
      downloadLink.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      downloadLink.click();
      
      // Clean up after delay
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
      }, 1000);
      
      
      
      // Method 3: Create data URL for manual access
      
      const pdfDataUrl = pdf.output('datauristring');
      
      
      // Method 4: Try forcing download with window.location
      
      try {
        const tempUrl = URL.createObjectURL(pdfBlob);
        window.location.href = tempUrl;
        
        setTimeout(() => URL.revokeObjectURL(tempUrl), 2000);
      } catch (locationError) {
        
      }
      
      // Method 5: Show PDF inline in current page
      
      
      // Create a popup modal with PDF preview and download options
      const pdfPreviewUrl = URL.createObjectURL(pdfBlob);
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      `;
      
      modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;">
            <h2 style="margin: 0; color: #1f4aa6; font-family: Arial, sans-serif;">PDF Generated Successfully!</h2>
            <button onclick="console.log('🔄 PDF Modal: Close button clicked'); this.closest('[role=modal]').remove();" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 16px;">✕</button>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0; color: #333; font-family: Arial, sans-serif;">Your ByteWise Nutrition Report is ready! Choose how to access it:</p>
          </div>
          
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
            <button onclick="
              console.log('🔄 PDF Modal: Download button clicked for:', '${filename}'); 
              const link = document.createElement('a'); 
              link.href = '${pdfPreviewUrl}'; 
              link.download = '${filename}'; 
              link.click(); 
              console.log('✅ PDF Modal: Download link triggered');
            " style="background: #45c757; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">📥 Download PDF</button>
            
            <button onclick="
              console.log('🔄 PDF Modal: View in new tab button clicked'); 
              const newWindow = window.open('${pdfPreviewUrl}', '_blank'); 
              if (newWindow) { 
                console.log('✅ PDF Modal: New tab opened successfully'); 
              } else { 
                console.log('❌ PDF Modal: Popup blocked - trying alternative method'); 
                window.location.href = '${pdfPreviewUrl}'; 
              }
            " style="background: #1f4aa6; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">👀 View in New Tab</button>
            
            <button onclick="console.log('🔄 PDF Modal: Copy button clicked, data length:', '${pdfDataUrl}'.length); navigator.clipboard.writeText('${pdfDataUrl}').then(() => { console.log('✅ PDF Modal: Data copied to clipboard successfully'); alert('PDF data copied! You can paste this into a file or share it.'); }).catch(err => { console.error('❌ PDF Modal: Copy to clipboard failed:', err); alert('Copy failed. Please try the download option instead.'); });" style="background: #ffd43b; color: black; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">📋 Copy PDF Data</button>
          </div>
          
          <iframe src="${pdfPreviewUrl}" style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 5px;"></iframe>
          
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666; text-align: center;">
            Report generated: ${new Date().toLocaleString()} | File: ${filename}
          </p>
        </div>
      `;
      
      modal.setAttribute('role', 'modal');
      document.body.appendChild(modal);
      
      
      // Auto-cleanup after 5 minutes
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
        URL.revokeObjectURL(pdfPreviewUrl);
        
      }, 300000);
      
      return true;
      
    } catch (downloadError) {
      console.error('❌ PDF Generation: Download failed:', downloadError);
      throw downloadError;
    }

  } catch (error) {
    console.error('PDF generation failed:', error);
    // PDF generation error logged for debugging
    return false;
  }
}
