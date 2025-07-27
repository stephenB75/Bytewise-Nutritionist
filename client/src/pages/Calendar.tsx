import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MealCard } from '@/components/MealCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface CalendarProps {
  onNavigate: (page: string) => void;
}

export default function Calendar({ onNavigate }: CalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get meals for the selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: selectedDateMeals } = useQuery({
    queryKey: ['/api/meals', { startDate: selectedDateStr, endDate: selectedDateStr }],
    enabled: !!user,
  });

  // Get stats for the selected date
  const { data: selectedDateStats } = useQuery({
    queryKey: ['/api/stats', selectedDateStr],
    enabled: !!user,
  });

  // Get meals for the entire month (for calendar dots)
  const monthStartStr = format(monthStart, 'yyyy-MM-dd');
  const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
  const { data: monthMeals } = useQuery({
    queryKey: ['/api/meals', { startDate: monthStartStr, endDate: monthEndStr }],
    enabled: !!user,
  });

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getDayMeals = (date: Date) => {
    if (!monthMeals) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return monthMeals.filter((meal: any) => 
      format(new Date(meal.date), 'yyyy-MM-dd') === dateStr
    );
  };

  const hasDataForDate = (date: Date) => {
    const dayMeals = getDayMeals(date);
    return dayMeals.length > 0;
  };

  // Calculate weekly stats
  const weeklyStats = {
    mealsLogged: selectedDateMeals?.length || 0,
    avgCalories: selectedDateStats?.totalCalories || 0,
    goalsMet: selectedDateStats ? 
      Math.round(((selectedDateStats.totalCalories / (user?.dailyCalorieGoal || 2000)) * 100)) : 0
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate the starting day of the month
  const startDay = monthStart.getDay();
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="bg-surface p-4 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Meal Calendar</h1>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full p-0"
          >
            <CalendarIcon size={20} />
          </Button>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full p-0"
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-full p-0"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Calendar Grid */}
        <Card className="p-4">
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for month start */}
            {emptyDays.map((index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            
            {/* Month days */}
            {monthDays.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const hasData = hasDataForDate(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square relative rounded-lg transition-all touch-target text-sm ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isCurrentDay
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>{format(date, 'd')}</span>
                  {hasData && (
                    <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary'
                    }`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Date Details */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
            <Badge 
              variant={selectedDateMeals && selectedDateMeals.length > 0 ? "default" : "secondary"}
              className="text-xs"
            >
              {selectedDateMeals && selectedDateMeals.length > 0 ? 'Logged' : 'No Data'}
            </Badge>
          </div>
          
          {selectedDateMeals && selectedDateMeals.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-4 text-center mb-4 p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-bold text-primary">
                    {selectedDateMeals.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Meals</div>
                </div>
                <div>
                  <div className="font-bold text-primary">
                    {Math.round(selectedDateStats?.totalCalories || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
                <div>
                  <div className="font-bold text-primary">
                    {Math.round(selectedDateStats?.totalProtein || 0)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedDateMeals.map((meal: any) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">No meals logged for this date</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('meals')}
              >
                Log a Meal
              </Button>
            </div>
          )}
        </Card>

        {/* Weekly/Monthly Stats */}
        <Card className="p-4">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold">This Week</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">12</div>
              <div className="text-xs text-muted-foreground">Meals</div>
            </div>
            <div>
              <div className="text-lg font-bold">1,847</div>
              <div className="text-xs text-muted-foreground">Avg Calories</div>
            </div>
            <div>
              <div className="text-lg font-bold">85%</div>
              <div className="text-xs text-muted-foreground">Goal Met</div>
            </div>
          </div>
        </Card>

        {/* Nutrition Goals for Selected Date */}
        {selectedDateStats && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Daily Goals Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Calories</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((selectedDateStats.totalCalories / (user?.dailyCalorieGoal || 2000)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((selectedDateStats.totalCalories / (user?.dailyCalorieGoal || 2000)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Protein</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-chart-2 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((selectedDateStats.totalProtein / (user?.dailyProteinGoal || 150)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((selectedDateStats.totalProtein / (user?.dailyProteinGoal || 150)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Water</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((selectedDateStats.waterGlasses / (user?.dailyWaterGoal || 8)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((selectedDateStats.waterGlasses / (user?.dailyWaterGoal || 8)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
