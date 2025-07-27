import { useState } from 'react';
import { Search, Filter, Star, Clock, Flame, Leaf, Award, Camera, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Simulate external food database
const FOOD_DATABASE = [
  {
    id: 'usda_001',
    name: 'Grilled Chicken Breast',
    brand: 'USDA Generic',
    category: 'Protein',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    serving: '100g',
    verified: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['High Protein', 'Low Carb', 'Lean']
  },
  {
    id: 'usda_002',
    name: 'Fresh Avocado',
    brand: 'Whole Foods',
    category: 'Healthy Fats',
    calories: 234,
    protein: 3,
    carbs: 12,
    fat: 21,
    fiber: 10,
    sugar: 1,
    sodium: 10,
    serving: '1 medium (150g)',
    verified: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Healthy Fats', 'High Fiber', 'Potassium']
  },
  {
    id: 'usda_003',
    name: 'Organic Quinoa',
    brand: 'Bob\'s Red Mill',
    category: 'Grains',
    calories: 222,
    protein: 8,
    carbs: 39,
    fat: 4,
    fiber: 5,
    sugar: 0,
    sodium: 13,
    serving: '1 cup cooked (185g)',
    verified: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Complete Protein', 'Gluten Free', 'High Fiber']
  },
  {
    id: 'usda_004',
    name: 'Greek Yogurt Plain',
    brand: 'Chobani',
    category: 'Dairy',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    fiber: 0,
    sugar: 4,
    sodium: 65,
    serving: '170g container',
    verified: true,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['High Protein', 'Probiotics', 'Low Fat']
  },
  {
    id: 'usda_005',
    name: 'Atlantic Salmon',
    brand: 'Wild Caught',
    category: 'Protein',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    serving: '100g fillet',
    verified: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Omega-3', 'High Protein', 'Wild Caught']
  },
  {
    id: 'usda_006',
    name: 'Baby Spinach',
    brand: 'Organic Farms',
    category: 'Vegetables',
    calories: 23,
    protein: 3,
    carbs: 4,
    fat: 0,
    fiber: 2,
    sugar: 0,
    sodium: 79,
    serving: '100g (3 cups)',
    verified: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Iron Rich', 'Low Calorie', 'Vitamin K']
  },
  {
    id: 'usda_007',
    name: 'Sweet Potato',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0,
    fiber: 4,
    sugar: 5,
    sodium: 7,
    serving: '1 medium (128g)',
    verified: true,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1551516580-8834406b3e7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Beta Carotene', 'Complex Carbs', 'Vitamin A']
  },
  {
    id: 'usda_008',
    name: 'Extra Virgin Olive Oil',
    brand: 'Mediterranean Gold',
    category: 'Oils',
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 14,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    serving: '1 tbsp (15ml)',
    verified: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    tags: ['Monounsaturated', 'Antioxidants', 'Heart Healthy']
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Foods', count: FOOD_DATABASE.length },
  { id: 'protein', name: 'Protein', count: FOOD_DATABASE.filter(f => f.category === 'Protein').length },
  { id: 'vegetables', name: 'Vegetables', count: FOOD_DATABASE.filter(f => f.category === 'Vegetables').length },
  { id: 'grains', name: 'Grains', count: FOOD_DATABASE.filter(f => f.category === 'Grains').length },
  { id: 'dairy', name: 'Dairy', count: FOOD_DATABASE.filter(f => f.category === 'Dairy').length },
  { id: 'healthy-fats', name: 'Healthy Fats', count: FOOD_DATABASE.filter(f => f.category === 'Healthy Fats').length }
];

interface FoodDatabaseProps {
  onNavigate?: (tab: string) => void;
}

export function FoodDatabase({ onNavigate }: FoodDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein' | 'rating'>('name');

  // Filter and sort foods
  const filteredFoods = FOOD_DATABASE
    .filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           food.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           food.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || 
                             food.category.toLowerCase().replace(' ', '-') === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'calories':
          return a.calories - b.calories;
        case 'protein':
          return b.protein - a.protein;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddFood = (food: any) => {
    // Store the food data to be picked up by the calculator
    const foodForCalculator = {
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      baseAmount: 100,
      baseUnit: 'g',
      image: food.image,
      brand: food.brand,
      category: food.category
    };

    localStorage.setItem('selectedFoodToAdd', JSON.stringify(foodForCalculator));
    
    if (onNavigate) {
      onNavigate('calculator');
    }
  };

  const handleScanBarcode = () => {
    alert('Barcode scanner would open camera here. This would use device camera to scan product barcodes and automatically look up nutrition information.');
  };

  const handleSortChange = () => {
    const sortOptions = ['name', 'calories', 'protein', 'rating'] as const;
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const addToRecentSearches = (food: any) => {
    const recentSearches = JSON.parse(localStorage.getItem('recentFoodSearches') || '[]');
    const updatedSearches = [food, ...recentSearches.filter((item: any) => item.id !== food.id)].slice(0, 10);
    localStorage.setItem('recentFoodSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="pb-24 max-w-md mx-auto animate-fade-in">
      {/* Hero Header with Search */}
      <div className="relative -mx-4 mb-6">
        <div className="h-48 relative overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
            alt="Fresh ingredients database"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-6 left-4 right-4 text-white">
            <h1 className="text-3xl font-bold mb-2">Food Database</h1>
            <p className="text-sm opacity-90 mb-4">Search thousands of verified ingredients</p>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
              <Input
                placeholder="Search foods, brands, or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70"
              />
              <button
                onClick={handleScanBarcode}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Categories</h2>
            <Button size="sm" variant="outline" onClick={handleSortChange}>
              <Filter size={14} className="mr-1" />
              Sort by {sortBy}
            </Button>
          </div>
          
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Header */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            {filteredFoods.length} foods found
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleClearSearch}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Food Grid */}
        <div className="space-y-4">
          {filteredFoods.map((food, index) => (
            <Card key={food.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                {/* Food Image with Clipping Path */}
                <div className="w-32 h-32 relative flex-shrink-0">
                  <ImageWithFallback
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                    style={{
                      clipPath: index % 3 === 0 
                        ? 'polygon(0 0, 85% 0, 100% 100%, 0% 100%)'
                        : index % 3 === 1
                        ? 'polygon(0 0, 100% 15%, 100% 100%, 0% 85%)'
                        : 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)'
                    }}
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-2 left-2 space-y-1">
                    {food.verified && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <Award size={10} className="mr-1" />
                        Verified
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="text-yellow-400 fill-current" size={10} />
                      <span className="text-white text-xs font-medium">{food.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Food Info */}
                <div className="flex-1 p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{food.name}</h3>
                    <p className="text-sm text-muted-foreground">{food.brand}</p>
                    <p className="text-xs text-muted-foreground">{food.serving}</p>
                  </div>

                  {/* Nutrition Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-chart-1/10">
                      <div className="font-bold text-chart-1">{food.calories}</div>
                      <div className="text-muted-foreground">cal</div>
                    </div>
                    <div className="p-2 rounded-lg bg-chart-2/10">
                      <div className="font-bold text-chart-2">{food.protein}g</div>
                      <div className="text-muted-foreground">protein</div>
                    </div>
                    <div className="p-2 rounded-lg bg-chart-4/10">
                      <div className="font-bold text-chart-4">{food.carbs}g</div>
                      <div className="text-muted-foreground">carbs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-chart-3/10">
                      <div className="font-bold text-chart-3">{food.fat}g</div>
                      <div className="text-muted-foreground">fat</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {food.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      addToRecentSearches(food);
                      handleAddFood(food);
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add to Calculator
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFoods.length === 0 && (
          <div className="text-center py-12">
            <Search className="text-muted-foreground mx-auto mb-4" size={48} />
            <h3 className="font-semibold mb-2">No foods found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or browse different categories
            </p>
            <Button variant="outline" onClick={handleClearSearch}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Database Stats */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div>
              <div className="font-bold text-lg">{FOOD_DATABASE.length}</div>
              <div className="text-muted-foreground">Foods</div>
            </div>
            <div>
              <div className="font-bold text-lg">98%</div>
              <div className="text-muted-foreground">Verified</div>
            </div>
            <div>
              <div className="font-bold text-lg">4.7</div>
              <div className="text-muted-foreground">Avg Rating</div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => alert('Food database is updated daily with new verified nutrition data from USDA and other trusted sources.')}
          >
            Learn more about our database
          </Button>
        </Card>
      </div>
    </div>
  );
}