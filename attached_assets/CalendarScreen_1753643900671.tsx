import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function CalendarScreen() {
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
      status: 'complete',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    },
    '2025-01-24': {
      meals: 2,
      calories: 1420,
      status: 'partial',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    },
    '2025-01-26': {
      meals: 4,
      calories: 2100,
      status: 'complete',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
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
    <div className="p-4 pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header with food imagery */}
      <div className="relative mb-6 -mx-4 -mt-4">
        <div 
          className="h-28 bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)'
          }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
            alt="Nutritious meal spread"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Meal Calendar</h1>
          <p className="text-muted-foreground">Track your daily nutrition journey</p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
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
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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
                    ? 'bg-primary text-primary-foreground'
                    : isTodayDate
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'hover:bg-muted/50'
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
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-4">
          <div className="flex items-start gap-3">
            {/* Food image with custom clipping */}
            <div 
              className="w-16 h-16 flex-shrink-0 overflow-hidden bg-muted/30"
              style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
              }}
            >
              <ImageWithFallback
                src={selectedDateData.image}
                alt="Daily meals"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedDateData.status === 'complete' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedDateData.status === 'complete' ? 'Complete' : 'Partial'}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Meals logged:</span>
                  <span className="font-medium">{selectedDateData.meals}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total calories:</span>
                  <span className="font-medium">{selectedDateData.calories}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-3" size="sm">
            View Details
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-4 text-center">
          <div 
            className="w-20 h-20 mx-auto mb-4 bg-muted/30 overflow-hidden"
            style={{
              clipPath: 'circle(40px at center)'
            }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
              alt="Add meal"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <h3 className="font-medium mb-2">No meals logged</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your nutrition for {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <Button className="bg-primary text-primary-foreground" size="sm">
            <Plus className="mr-2" size={16} />
            Add Meal
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex items-center mb-3">
          <TrendingUp className="text-primary mr-2" size={20} />
          <h3 className="font-medium">This Week</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">12</div>
            <div className="text-xs text-muted-foreground">Meals</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">1,847</div>
            <div className="text-xs text-muted-foreground">Avg Calories</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">85%</div>
            <div className="text-xs text-muted-foreground">Goal Met</div>
          </div>
        </div>
      </div>
    </div>
  );
}