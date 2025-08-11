/**
 * PDF Export Utility
 * 
 * Creates actual PDF reports for user progress data over 6 months using jsPDF
 */

import { jsPDF } from 'jspdf';

interface UserProgressData {
  totalMealsLogged: number;
  averageDailyCalories: number;
  streakRecord: number;
  goalCompletionRate: number;
  achievements: number;
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
    const storedMeals = localStorage.getItem('meals');
    const storedCalorieGoal = localStorage.getItem('calorieGoal');
    const storedUserProfile = localStorage.getItem('userProfile');
    
    // Parse stored data
    const meals = storedMeals ? JSON.parse(storedMeals) : [];
    const calorieGoal = storedCalorieGoal ? parseInt(storedCalorieGoal) : 2000;
    const userProfile = storedUserProfile ? JSON.parse(storedUserProfile) : {};
    
    // Calculate real statistics from stored meals
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    // Filter meals from last 6 months
    const recentMeals = meals.filter((meal: any) => {
      const mealDate = new Date(meal.date);
      return mealDate >= sixMonthsAgo && mealDate <= now;
    });
    
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
    
    // Gather user progress data
    const progressData: UserProgressData = {
      totalMealsLogged,
      averageDailyCalories,
      streakRecord: maxStreak,
      goalCompletionRate,
      achievements,
      monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : [
        { month: 'No data yet', calories: 0, meals: 0, goals: 0 }
      ]
    };

    // Create PDF directly using jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    let yPosition = 25;

    // Add logo - using public icon file
    try {
      // Fetch and convert the logo to base64
      const logoUrl = '/icons/icon-192x192.png';
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const logoData = reader.result as string;
      
      // Add logo to PDF (centered, 30mm width)
      const logoWidth = 30;
      const logoHeight = 30;
      const logoX = (pageWidth - logoWidth) / 2;
      
      pdf.addImage(logoData, 'PNG', logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 10;
    } catch (logoError) {
      // If logo fails to load, continue without it
      console.warn('Could not load logo for PDF:', logoError);
    }

    // Brand Name with colors
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166); // ByteWise blue color
    pdf.text('ByteWise', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(69, 199, 62); // ByteWise green color
    pdf.text('Nutritionist', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    pdf.setTextColor(100, 100, 100); // Gray for subtitle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('6-Month Progress Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 7;
    pdf.setFontSize(10);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
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

    // Monthly Breakdown
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 74, 166); // Blue for section headers
    pdf.text('Monthly Breakdown', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 15;

    progressData.monthlyBreakdown.forEach((month, idx) => {
      // Alternate background colors for readability
      if (idx % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 74, 166);
      pdf.text(month.month, 20, yPosition);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Draw small colored indicators for each metric
      const metricsX = 70;
      
      // Calories with green dot
      pdf.setFillColor(69, 199, 62);
      pdf.circle(metricsX, yPosition - 1, 1.5, 'F');
      pdf.text(`${month.calories.toLocaleString()} cal`, metricsX + 5, yPosition);
      
      // Meals with blue dot
      pdf.setFillColor(31, 74, 166);
      pdf.circle(metricsX + 35, yPosition - 1, 1.5, 'F');
      pdf.text(`${month.meals} meals`, metricsX + 40, yPosition);
      
      // Goals with yellow dot
      pdf.setFillColor(250, 237, 57);
      pdf.circle(metricsX + 70, yPosition - 1, 1.5, 'F');
      pdf.text(`${month.goals} goals`, metricsX + 75, yPosition);
      
      yPosition += 12;
    });

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
    pdf.text('Keep up the great work on your nutrition journey!', pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF with proper download functionality
    const filename = `bytewise-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Use jsPDF's built-in save method which triggers download
    pdf.save(filename);
    
    return true;

  } catch (error) {
    console.error('PDF generation failed:', error);
    // PDF generation error logged for debugging
    return false;
  }
}
