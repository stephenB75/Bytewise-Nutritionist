import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, Target } from 'lucide-react';
import { formatDate, formatCalories, calculatePercentage } from '@/lib/utils';

interface CalendarProps {
  onNavigate: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function Calendar({ onNavigate, showToast, notifications, setNotifications }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch nutrition data for the selected month
  const { data: monthlyData } = useQuery({
    queryKey: ['/api/meals/monthly', currentDate.getFullYear(), currentDate.getMonth()],
    retry: false,
  });

  // Fetch specific day data
  const { data: dayData } = useQuery({
    queryKey: ['/api/meals/date', selectedDate.toISOString().split('T')[0]],
    retry: false,
  });

  // Mock monthly data for demonstration
  const mockMonthlyData = {
    '2024-01-15': { calories: 1850, protein: 145, carbs: 180, fat: 65, complete: true },
    '2024-01-16': { calories: 2100, protein: 160, carbs: 210, fat: 78, complete: true },
    '2024-01-17': { calories: 1920, protein: 138, carbs: 195, fat: 68, complete: true },
    '2024-01-18': { calories: 1680, protein: 125, carbs: 165, fat: 58, complete: false },
    '2024-01-19': { calories: 2250, protein: 175, carbs: 225, fat: 85, complete: true },
    '2024-01-20': { calories: 1950, protein: 148, carbs: 188, fat: 72, complete: true },
  };

  const nutritionData = monthlyData || mockMonthlyData;

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDayData = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return nutritionData[dateKey];
  };

  const getDayStatus = (date: Date) => {
    const data = getDayData(date);
    if (!data) return 'none';
    
    const calorieGoal = 2000; // Should come from user profile
    const calorieProgress = calculatePercentage(data.calories, calorieGoal);
    
    if (calorieProgress < 50) return 'low';
    if (calorieProgress >= 50 && calorieProgress < 90) return 'good';
    if (calorieProgress >= 90 && calorieProgress <= 110) return 'perfect';
    return 'high';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      case 'good': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'perfect': return 'bg-green-100 text-green-700 border-green-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const selectedDayData = getDayData(selectedDate);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold brand-text-primary mb-2">Nutrition Calendar</h1>
        <p className="text-muted-foreground">Track your daily nutrition progress over time</p>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="touch-target"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="touch-target"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const status = getDayStatus(date);
              const dayData = getDayData(date);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative p-2 text-sm rounded-lg border-2 transition-all touch-target
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent'}
                    ${isCurrentMonth(date) ? '' : 'opacity-40'}
                    ${getStatusColor(status)}
                    ${isToday(date) ? 'ring-2 ring-primary/50' : ''}
                    hover:scale-105 active:scale-95
                  `}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  {dayData && (
                    <div className="text-xs mt-1">
                      {formatCalories(dayData.calories)}
                    </div>
                  )}
                  {isToday(date) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
              <span>Under target</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
              <span>Good progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span>On target</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
              <span>Over target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      {selectedDayData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>{formatDate(selectedDate)} Details</span>
              <Badge 
                variant="outline" 
                className={getStatusColor(getDayStatus(selectedDate))}
              >
                {formatCalories(selectedDayData.calories)} calories
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{formatCalories(selectedDayData.calories)}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-2">{selectedDayData.protein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-3">{selectedDayData.carbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-chart-1">{selectedDayData.fat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 touch-target"
                onClick={() => {
                  onNavigate('meals');
                  showToast(`Opening meal logger for ${formatDate(selectedDate)}`);
                }}
              >
                View Meals
              </Button>
              <Button
                variant="outline"
                className="flex-1 touch-target"
                onClick={() => {
                  onNavigate('meals');
                  showToast('Add meal for this day');
                }}
              >
                Add Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Monthly Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  {Object.keys(nutritionData).length}
                </div>
                <div className="text-sm text-muted-foreground">Days Tracked</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  {Object.values(nutritionData).filter((day: any) => day.complete).length}
                </div>
                <div className="text-sm text-muted-foreground">Complete Days</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  Object.values(nutritionData).reduce((avg: number, day: any) => avg + day.calories, 0) / 
                  Object.keys(nutritionData).length
                )}
              </div>
              <div className="text-sm text-muted-foreground">Average Daily Calories</div>
            </div>

            <Button
              variant="outline"
              className="w-full touch-target"
              onClick={() => {
                onNavigate('dashboard');
                showToast('Viewing detailed analytics');
              }}
            >
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}