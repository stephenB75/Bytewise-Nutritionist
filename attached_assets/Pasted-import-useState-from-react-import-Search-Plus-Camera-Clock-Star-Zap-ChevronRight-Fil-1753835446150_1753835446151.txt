import { useState } from 'react';
import { Search, Plus, Camera, Clock, Star, Zap, ChevronRight, Filter, ScanLine, Utensils, Coffee, Sunset, Moon, Flame, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function MealsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-orange-100 text-orange-700', count: 12 },
    { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'bg-green-100 text-green-700', count: 8 },
    { id: 'dinner', label: 'Dinner', icon: Sunset, color: 'bg-blue-100 text-blue-700', count: 15 },
    { id: 'snack', label: 'Snack', icon: Moon, color: 'bg-purple-100 text-purple-700', count: 6 }
  ];

  const featuredFoods = [
    {
      id: 'featured-1',
      name: 'Rainbow Buddha Bowl',
      description: 'Quinoa, roasted vegetables, tahini dressing',
      calories: 485,
      protein: 18,
      carbs: 52,
      fat: 22,
      rating: 4.9,
      cookTime: '25 min',
      difficulty: 'Easy',
      tags: ['Vegan', 'High Protein', 'Gluten Free'],
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      chef: 'Chef Maria'
    },
    {
      id: 'featured-2',
      name: 'Grilled Salmon Power Plate',
      description: 'Atlantic salmon, sweet potato, asparagus',
      calories: 520,
      protein: 42,
      carbs: 28,
      fat: 25,
      rating: 4.8,
      cookTime: '20 min',
      difficulty: 'Medium',
      tags: ['High Protein', 'Omega-3', 'Keto Friendly'],
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
      chef: 'Chef James'
    }
  ];

  const recentFoods = [
    {
      id: '1',
      name: 'Grilled Chicken Breast',
      brand: 'Organic Valley',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      serving: '100g',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      lastUsed: '2 hours ago',
      verified: true,
      frequency: 'Daily'
    },
    {
      id: '2',
      name: 'Greek Yogurt Plain',
      brand: 'Chobani',
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0,
      serving: '170g',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      lastUsed: 'Yesterday',
      verified: true,
      frequency: 'Often'
    },
    {
      id: '3',
      name: 'Avocado Medium',
      brand: 'Fresh Market',
      calories: 234,
      protein: 3,
      carbs: 12,
      fat: 21,
      serving: '1 whole',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      lastUsed: '3 days ago',
      verified: true,
      frequency: 'Weekly'
    }
  ];

  const quickAddItems = [
    { name: 'Water', calories: 0, icon: '💧', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
    { name: 'Coffee', calories: 5, icon: '☕', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
    { name: 'Banana', calories: 105, icon: '🍌', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700' },
    { name: 'Apple', calories: 95, icon: '🍎', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
    { name: 'Almonds', calories: 160, icon: '🥜', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
    { name: 'Protein Shake', calories: 120, icon: '🥤', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' }
  ];

  const popularFoods = [
    {
      id: '4',
      name: 'Overnight Oats with Berries',
      category: 'Breakfast',
      calories: 320,
      protein: 12,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      prepTime: '5 min',
      tags: ['Quick', 'High Fiber']
    },
    {
      id: '5',
      name: 'Mediterranean Chicken Salad',
      category: 'Lunch',
      calories: 470,
      protein: 35,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      prepTime: '15 min',
      tags: ['High Protein', 'Fresh']
    },
    {
      id: '6',
      name: 'Teriyaki Salmon Bowl',
      category: 'Dinner',
      calories: 520,
      protein: 35,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
      prepTime: '20 min',
      tags: ['Omega-3', 'Asian']
    }
  ];

  const nutritionStats = [
    { label: 'Avg Calories', value: '1,850', change: '+5%', color: 'text-chart-1' },
    { label: 'Protein Goal', value: '125g', change: '83%', color: 'text-chart-2' },
    { label: 'Meals Logged', value: '28', change: '+12', color: 'text-chart-3' },
    { label: 'Streak Days', value: '7', change: 'New!', color: 'text-chart-4' }
  ];

  return (
    <div className="pb-24 max-w-md mx-auto animate-fade-in">
      {/* Hero Header with Food Background */}
      <div className="relative -mx-4 mb-6">
        <div className="h-40 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80"
            alt="Delicious food spread"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold mb-1">Discover Food</h1>
            <p className="text-sm opacity-90">Find and track your favorite meals</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Nutrition Stats Cards */}
        <div className="grid grid-cols-4 gap-2">
          {nutritionStats.map((stat, index) => (
            <Card key={index} className="p-3 text-center card-gradient">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <h3 className={`text-lg font-bold ${stat.color}`}>{stat.value}</h3>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Enhanced Search Bar */}
        <Card className="p-4 card-gradient">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search foods, recipes, or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 border-0 bg-white/70"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20">
                <Camera size={16} />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20">
                <ScanLine size={16} />
              </Button>
            </div>
          </div>

          {/* Quick Add Pills */}
          <div className="flex flex-wrap gap-2">
            {quickAddItems.map((item, index) => (
              <button
                key={index}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${item.color} hover:shadow-sm transition-all text-sm font-medium`}
              >
                <span className="text-base">{item.icon}</span>
                <span className={item.textColor}>{item.name}</span>
                <span className="text-xs text-muted-foreground">({item.calories})</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Featured Recipes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Today</h2>
            <Badge variant="secondary" className="text-xs">
              <Flame size={10} className="mr-1" />
              Trending
            </Badge>
          </div>
          
          <div className="space-y-4">
            {featuredFoods.map((food) => (
              <Card key={food.id} className="p-0 overflow-hidden card-gradient hover:shadow-lg transition-shadow">
                <div className="relative h-32">
                  <ImageWithFallback
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="text-yellow-500 fill-current" size={12} />
                      <span className="text-xs font-semibold">{food.rating}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs bg-white/90 text-black">
                      {food.cookTime}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold mb-1">{food.name}</h3>
                    <p className="text-xs opacity-90">{food.description}</p>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {food.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-center text-xs">
                    <div>
                      <div className="font-bold text-chart-1">{food.calories}</div>
                      <div className="text-muted-foreground">calories</div>
                    </div>
                    <div>
                      <div className="font-bold text-chart-2">{food.protein}g</div>
                      <div className="text-muted-foreground">protein</div>
                    </div>
                    <div>
                      <div className="font-bold text-chart-4">{food.carbs}g</div>
                      <div className="text-muted-foreground">carbs</div>
                    </div>
                    <div>
                      <div className="font-bold text-chart-3">{food.fat}g</div>
                      <div className="text-muted-foreground">fat</div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Plus size={16} className="mr-2" />
                    Add to Meal
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Meal Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setSelectedMealType(meal.id as any)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedMealType === meal.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${meal.color} flex items-center justify-center mx-auto mb-2`}>
                <meal.icon size={18} />
              </div>
              <div className="text-xs font-semibold mb-1">{meal.label}</div>
              <div className="text-xs text-muted-foreground">{meal.count} items</div>
            </button>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="meals">My Meals</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Foods</h2>
              <Clock className="text-muted-foreground" size={16} />
            </div>
            
            <div className="space-y-3">
              {recentFoods.map((food) => (
                <Card key={food.id} className="p-4 hover:shadow-sm transition-shadow cursor-pointer card-gradient">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{food.name}</h3>
                          {food.verified && (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {food.frequency}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {food.brand} • {food.serving}
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-chart-1">{food.calories}</div>
                          <div className="text-muted-foreground">cal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-chart-2">{food.protein}g</div>
                          <div className="text-muted-foreground">protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-chart-4">{food.carbs}g</div>
                          <div className="text-muted-foreground">carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-chart-3">{food.fat}g</div>
                          <div className="text-muted-foreground">fat</div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">Last used: {food.lastUsed}</p>
                    </div>
                    
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popular for {selectedMealType}</h2>
              <TrendingUp className="text-muted-foreground" size={16} />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {popularFoods.map((food) => (
                <Card key={food.id} className="p-0 overflow-hidden hover:shadow-sm transition-shadow cursor-pointer card-gradient">
                  <div className="flex">
                    <div className="w-24 h-24 relative">
                      <ImageWithFallback
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{food.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-500 fill-current" size={12} />
                          <span className="text-xs font-medium">{food.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          {food.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{food.prepTime}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {food.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-chart-1 font-semibold">{food.calories} cal</span>
                          <span className="text-chart-2 font-semibold">{food.protein}g protein</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Saved Meals</h2>
              <Button size="sm" variant="outline">
                <Plus size={14} className="mr-1" />
                Create Meal
              </Button>
            </div>
            
            <Card className="p-8 text-center card-gradient">
              <Utensils className="text-muted-foreground mx-auto mb-4" size={48} />
              <h3 className="font-semibold mb-2">No saved meals yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create custom meals to quickly log your favorite combinations
              </p>
              <Button size="sm">
                <Plus size={14} className="mr-1" />
                Create Your First Meal
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}