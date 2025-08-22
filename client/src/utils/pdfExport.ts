/**
 * Enhanced PDF Export Utility
 * 
 * Creates comprehensive PDF reports with 30-day daily/weekly nutrition breakdowns
 */

import { jsPDF } from 'jspdf';

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
  totalMealsLogged: number;
  averageDailyCalories: number;
  streakRecord: number;
  goalCompletionRate: number;
  achievements: number;
  dailyBreakdown: DailyNutritionData[];
  weeklyBreakdown: WeeklyNutritionData[];
  monthlyBreakdown: Array<{
    month: string;
    calories: number;
    meals: number;
    goals: number;
  }>;
}

export async function generateProgressReportPDF(): Promise<boolean> {
  try {
    // Fetch actual user data from local storage and API
    const storedMeals = localStorage.getItem('weeklyMeals'); // Use weeklyMeals for comprehensive data
    const storedCalorieGoal = localStorage.getItem('calorieGoal');
    const storedUserProfile = localStorage.getItem('userProfile');
    
    // Parse stored data
    const meals = storedMeals ? JSON.parse(storedMeals) : [];
    const calorieGoal = storedCalorieGoal ? parseInt(storedCalorieGoal) : 2000;
    const userProfile = storedUserProfile ? JSON.parse(storedUserProfile) : {};
    
    // Calculate real statistics from stored meals for 30-day period
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Filter meals from last 30 days
    const recentMeals = meals.filter((meal: any) => {
      let mealDate;
      // Handle both date formats: "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss.sssZ"
      if (meal.date && meal.date.includes('T')) {
        mealDate = new Date(meal.date);
      } else {
        mealDate = new Date(meal.date);
      }
      return mealDate >= thirtyDaysAgo && mealDate <= now;
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
      
      // Calculate daily totals
      const dailyData: DailyNutritionData = {
        date: dateKey,
        calories: dayMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0),
        protein: dayMeals.reduce((sum: number, meal: any) => sum + (meal.protein || 0), 0),
        carbs: dayMeals.reduce((sum: number, meal: any) => sum + (meal.carbs || 0), 0),
        fat: dayMeals.reduce((sum: number, meal: any) => sum + (meal.fat || 0), 0),
        fiber: dayMeals.reduce((sum: number, meal: any) => sum + (meal.fiber || 0), 0),
        sodium: dayMeals.reduce((sum: number, meal: any) => sum + (meal.sodium || 0), 0),
        vitaminC: dayMeals.reduce((sum: number, meal: any) => sum + (meal.vitaminC || 0), 0),
        vitaminD: dayMeals.reduce((sum: number, meal: any) => sum + (meal.vitaminD || 0), 0),
        vitaminB12: dayMeals.reduce((sum: number, meal: any) => sum + (meal.vitaminB12 || 0), 0),
        folate: dayMeals.reduce((sum: number, meal: any) => sum + (meal.folate || 0), 0),
        iron: dayMeals.reduce((sum: number, meal: any) => sum + (meal.iron || 0), 0),
        calcium: dayMeals.reduce((sum: number, meal: any) => sum + (meal.calcium || 0), 0),
        zinc: dayMeals.reduce((sum: number, meal: any) => sum + (meal.zinc || 0), 0),
        magnesium: dayMeals.reduce((sum: number, meal: any) => sum + (meal.magnesium || 0), 0),
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
    
    // Calculate monthly breakdown
    const monthlyData = new Map();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      monthlyData.set(monthKey, {
        month: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear(),
        calories: 0,
        meals: 0,
        goals: 0
      });
    }
    
    // Process meals data
    recentMeals.forEach((meal: any) => {
      const mealDate = new Date(meal.date);
      const monthKey = `${mealDate.getFullYear()}-${mealDate.getMonth()}`;
      
      if (monthlyData.has(monthKey)) {
        const monthStats = monthlyData.get(monthKey);
        monthStats.calories += meal.calories || 0;
        monthStats.meals += 1;
        
        // Check if daily goal was met
        const dayKey = meal.date;
        const dayCalories = recentMeals
          .filter((m: any) => m.date === dayKey)
          .reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        
        if (dayCalories >= calorieGoal * 0.9 && dayCalories <= calorieGoal * 1.1) {
          monthStats.goals += 1;
        }
      }
    });
    
    // Convert to array and sort by month
    const monthlyBreakdown = Array.from(monthlyData.values())
      .reverse()
      .map(month => ({
        month: `${month.month} ${month.year}`,
        calories: month.calories,
        meals: month.meals,
        goals: month.goals
      }));
    
    // Calculate overall statistics
    const totalMealsLogged = recentMeals.length;
    const totalCalories = recentMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
    const daysWithMeals = new Set(recentMeals.map((meal: any) => meal.date)).size;
    const averageDailyCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;
    
    // Calculate streak (simplified)
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedDates = Array.from(new Set(recentMeals.map((meal: any) => meal.date))).sort();
    
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
    
    // Calculate goal completion rate
    const daysWithGoalMet = recentMeals.reduce((count: number, meal: any) => {
      const dayCalories = recentMeals
        .filter((m: any) => m.date === meal.date)
        .reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
      
      return dayCalories >= calorieGoal * 0.9 && dayCalories <= calorieGoal * 1.1 ? count + 1 : count;
    }, 0);
    
    const goalCompletionRate = daysWithMeals > 0 ? Math.round((daysWithGoalMet / daysWithMeals) * 100) : 0;
    
    // Count achievements (simplified)
    const achievements = Math.floor(totalMealsLogged / 10); // 1 achievement per 10 meals
    
    // Gather comprehensive user progress data
    const progressData: UserProgressData = {
      totalMealsLogged,
      averageDailyCalories,
      streakRecord: maxStreak,
      goalCompletionRate,
      achievements,
      dailyBreakdown,
      weeklyBreakdown,
      monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : [
        { month: 'No data yet', calories: 0, meals: 0, goals: 0 }
      ]
    };

    // Create PDF directly using jsPDF
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
    
    // Add a decorative line
    yPosition += 10;
    pdf.setDrawColor(250, 237, 57); // ByteWise yellow
    pdf.setLineWidth(0.5);
    pdf.line(40, yPosition, pageWidth - 40, yPosition);
    
    yPosition += 15;
    
    // Reset text color to black for content
    pdf.setTextColor(0, 0, 0);

    // Statistics Grid
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166); // Blue for section headers
    pdf.text('Nutrition Summary', 20, yPosition);
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition += 15;

    const stats = [
      { label: 'Total Meals Logged', value: progressData.totalMealsLogged.toString(), color: [69, 199, 62] }, // Green
      { label: 'Average Daily Calories', value: progressData.averageDailyCalories.toString(), color: [31, 74, 166] }, // Blue
      { label: 'Best Streak (days)', value: progressData.streakRecord.toString(), color: [250, 237, 57] }, // Yellow
      { label: 'Goal Completion Rate', value: `${progressData.goalCompletionRate}%`, color: [69, 199, 62] }, // Green
      { label: 'Achievements Earned', value: progressData.achievements.toString(), color: [31, 74, 166] }, // Blue
      { label: 'Total Calories Tracked', value: `${Math.round(progressData.monthlyBreakdown.reduce((sum, m) => sum + m.calories, 0) / 1000)}k`, color: [250, 237, 57] } // Yellow
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

    // Weekly Nutrition Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166); // Blue for section headers
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
        pdf.setTextColor(31, 74, 166);
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

    // Daily Nutrition Breakdown
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166);
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
        pdf.setTextColor(31, 74, 166);
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

    // Footer with branding
    yPosition = pageHeight - 30;
    
    // Add footer line
    pdf.setDrawColor(250, 237, 57); // ByteWise yellow
    pdf.setLineWidth(0.3);
    pdf.line(40, yPosition, pageWidth - 40, yPosition);
    
    yPosition += 8;
    
    // Footer text with brand colors
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166); // Blue
    pdf.text('ByteWise', pageWidth / 2 - 20, yPosition, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(69, 199, 62); // Green
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
            <button onclick="this.closest('[role=modal]').remove();" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 16px;">✕</button>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0; color: #333; font-family: Arial, sans-serif;">Your ByteWise Nutrition Report is ready! Choose how to access it:</p>
          </div>
          
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
            <button onclick="
              const link = document.createElement('a'); 
              link.href = '${pdfPreviewUrl}'; 
              link.download = '${filename}'; 
              link.click();
            " style="background: #45c757; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">📥 Download PDF</button>
            
            <button onclick="
              const newWindow = window.open('${pdfPreviewUrl}', '_blank'); 
              if (!newWindow) { 
                window.location.href = '${pdfPreviewUrl}'; 
              }
            " style="background: #1f4aa6; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">👀 View in New Tab</button>
            
            <button onclick="navigator.clipboard.writeText('${pdfDataUrl}').then(() => { alert('PDF data copied! You can paste this into a file or share it.'); }).catch(err => { alert('Copy failed. Please try the download option instead.'); });" style="background: #ffd43b; color: black; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">📋 Copy PDF Data</button>
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
      throw downloadError;
    }

  } catch (error) {
    console.error('PDF generation failed:', error);
    // PDF generation error logged for debugging
    return false;
  }
}
