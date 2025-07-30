import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  onNavigate?: (tab: string) => void;
  showToast: (message: string, type?: 'default' | 'destructive') => void;
  notifications: string[];
  setNotifications: (notifications: string[]) => void;
}

export default function Calendar({ onNavigate }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Mock meal data for specific dates
  const mealData = {
    '2025-01-25': {
      meals: 3,
      calories: 1850,
      status: 'complete'
    },
    '2025-01-24': {
      meals: 2,
      calories: 1420,
      status: 'partial'
    },
    '2025-01-26': {
      meals: 4,
      calories: 2100,
      status: 'complete'
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const days = getDaysInMonth(currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectedDateData = mealData[formatDateKey(selectedDate)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-yellow via-white to-pastel-blue">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pastel-yellow to-pastel-blue p-6 pt-8">
        <div className="max-w-lg mx-auto">
          <h1 
            className="text-2xl font-bold text-black mb-2"
            style={{ fontFamily: "'League Spartan', sans-serif" }}
          >
            Meal Calendar
          </h1>
          <p 
            className="text-sm text-black/70"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Track your daily nutrition journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto p-4 -mt-4">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 
            className="text-lg font-semibold"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border-0 mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="aspect-square"></div>;
              }

              const dateKey = formatDateKey(day);
              const dayData = mealData[dateKey];
              const isSelected = isSameDate(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square relative rounded-lg transition-all ${
                    isSelected
                      ? 'bg-pastel-blue text-white'
                      : isTodayDate
                      ? 'bg-pastel-blue/20 text-pastel-blue font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">{day.getDate()}</span>
                  {dayData && (
                    <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      dayData.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
                    } ${isSelected ? 'bg-white' : ''}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDateData ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border-0 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 
                    className="font-semibold text-gray-900"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate?.('meals')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Meal
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Meals Logged</p>
                    <p className="font-semibold text-lg">{selectedDateData.meals}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Calories</p>
                    <p className="font-semibold text-lg">{selectedDateData.calories}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedDateData.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {selectedDateData.status === 'complete' ? 'Complete day' : 'Partial logging'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border-0 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 
              className="font-semibold text-gray-900 mb-2"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              No meals logged
            </h3>
            <p 
              className="text-gray-600 mb-4"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Start tracking your nutrition for this day
            </p>
            <Button onClick={() => onNavigate?.('meals')}>
              <Plus className="w-4 h-4 mr-2" />
              Log First Meal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}