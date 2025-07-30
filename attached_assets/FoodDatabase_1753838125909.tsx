/**
 * Bytewise USDA Food Database Browser
 * 
 * Comprehensive food database interface for browsing, searching, and exploring
 * the complete USDA Food Data Central database with offline capabilities.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Bookmark, TrendingUp, Database, Loader, Eye, Plus, Star, ChevronRight, Grid, List, ArrowUpDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFoodDatabase, LocalFoodItem } from './FoodDatabaseManager';

interface FoodDatabaseProps {
  onSelectFood?: (food: LocalFoodItem) => void;
  mode?: 'browser' | 'selector';
}

export function FoodDatabase({ onSelectFood, mode = 'browser' }: FoodDatabaseProps) {
  const { 
    searchFoods, 
    getFoodsByCategory, 
    getPopularFoods, 
    isLoading, 
    isInitialized, 
    getDatabaseStats 
  } = useFoodDatabase();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isSearching, setIsSearching] = useState(false);
  
  // Food data
  const [searchResults, setSearchResults] = useState<LocalFoodItem[]>([]);
  const [popularFoods, setPopularFoods] = useState<LocalFoodItem[]>([]);
  const [categoryFoods, setCategoryFoods] = useState<LocalFoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<LocalFoodItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Food categories based on USDA classifications
  const foodCategories = [
    { id: 'all', name: 'All Foods', count: 0, icon: '📋' },
    { id: 'dairy', name: 'Dairy Products', count: 0, icon: '🥛' },
    { id: 'meat', name: 'Meat & Poultry', count: 0, icon: '🥩' },
    { id: 'seafood', name: 'Fish & Seafood', count: 0, icon: '🐟' },
    { id: 'vegetables', name: 'Vegetables', count: 0, icon: '🥕' },
    { id: 'fruits', name: 'Fruits', count: 0, icon: '🍎' },
    { id: 'grains', name: 'Grains & Cereals', count: 0, icon: '🌾' },
    { id: 'nuts', name: 'Nuts & Seeds', count: 0, icon: '🥜' },
    { id: 'beverages', name: 'Beverages', count: 0, icon: '🥤' },
    { id: 'snacks', name: 'Snacks & Sweets', count: 0, icon: '🍪' }
  ];

  // Load initial data
  useEffect(() => {
    if (isInitialized) {
      loadPopularFoods();
      loadFavorites();
    }
  }, [isInitialized]);

  // Search with debouncing
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchFoods(query, 50);
        setSearchResults(results);
        console.log(`🔍 Found ${results.length} foods for "${query}"`);
      } catch (error) {
        console.error('❌ Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [searchFoods]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Category filter
  useEffect(() => {
    if (selectedCategory === 'all') {
      setCategoryFoods([]);
    } else {
      loadCategoryFoods(selectedCategory);
    }
  }, [selectedCategory]);

  // Load popular foods
  const loadPopularFoods = async () => {
    try {
      const foods = await getPopularFoods();
      setPopularFoods(foods);
    } catch (error) {
      console.error('❌ Failed to load popular foods:', error);
    }
  };

  // Load category foods
  const loadCategoryFoods = async (category: string) => {
    try {
      const foods = await getFoodsByCategory(category);
      setCategoryFoods(foods);
    } catch (error) {
      console.error('❌ Failed to load category foods:', error);
      setCategoryFoods([]);
    }
  };

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('bytewise-favorite-foods');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('❌ Failed to load favorites:', error);
    }
  };

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: number[]) => {
    try {
      localStorage.setItem('bytewise-favorite-foods', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('❌ Failed to save favorites:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = (fdcId: number) => {
    const newFavorites = favorites.includes(fdcId)
      ? favorites.filter(id => id !== fdcId)
      : [...favorites, fdcId];
    saveFavorites(newFavorites);
  };

  // Get current foods based on active tab
  const getCurrentFoods = () => {
    if (searchQuery.trim()) return searchResults;
    if (selectedCategory !== 'all') return categoryFoods;
    return popularFoods;
  };

  // Sort foods
  const sortedFoods = useMemo(() => {
    const foods = getCurrentFoods();
    return [...foods].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.description.localeCompare(b.description);
        case 'calories':
          return b.calories - a.calories;
        case 'protein':
          return b.protein - a.protein;
        default:
          return 0;
      }
    });
  }, [getCurrentFoods(), sortBy]);

  // Handle food selection
  const handleFoodSelect = (food: LocalFoodItem) => {
    setSelectedFood(food);
    if (onSelectFood && mode === 'selector') {
      onSelectFood(food);
    }
  };

  // Add to recipe builder
  const addToRecipeBuilder = (food: LocalFoodItem) => {
    localStorage.setItem('quickAddIngredient', JSON.stringify({
      fdcId: food.fdcId,
      name: food.description
    }));
    
    // Show toast
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { message: `${food.description} ready for Recipe Builder! 🍳` }
    }));
  };

  // Get database stats
  const stats = getDatabaseStats();

  if (!isInitialized) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Loading food database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Database Header */}
      <Card className="p-4 bg-gradient-to-r from-pastel-blue/10 to-pastel-yellow/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="text-primary" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "1.5rem", fontWeight: 600 }}>
              USDA Food Database
            </h2>
            <p className="text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              Complete nutritional information for thousands of foods
            </p>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              {stats.totalFoods.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Foods Available
            </div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              {stats.isOnline ? 'Ready' : 'Offline'}
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Database Status
            </div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 text-brand-heading" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              {Math.round(stats.storageUsed / 1024)}KB
            </div>
            <div className="text-xs text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              Storage Used
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods, brands, or ingredients..."
              className="pl-10 text-brand-body"
              style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "1rem", fontWeight: 400 }}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <Loader className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>{category.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">
                  <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>Name</span>
                </SelectItem>
                <SelectItem value="calories">
                  <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>Calories</span>
                </SelectItem>
                <SelectItem value="protein">
                  <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>Protein</span>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 px-2"
              >
                <List size={14} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 px-2"
              >
                <Grid size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
            {searchQuery ? `Search Results (${sortedFoods.length})` : 
             selectedCategory !== 'all' ? `${foodCategories.find(cat => cat.id === selectedCategory)?.name || 'Category'} (${sortedFoods.length})` :
             `Popular Foods (${sortedFoods.length})`}
          </h3>
          <Badge variant="secondary" className="text-xs text-brand-body">
            <ArrowUpDown size={12} className="mr-1" />
            {sortBy}
          </Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground text-sm text-brand-body">Loading foods...</p>
          </div>
        ) : sortedFoods.length > 0 ? (
          <div className={`space-y-2 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}`}>
            {sortedFoods.map((food) => (
              <div
                key={food.fdcId}
                className={`bg-white rounded-lg border hover:border-primary/50 transition-all cursor-pointer hover:shadow-sm ${viewMode === 'grid' ? 'p-4' : 'p-3'}`}
                onClick={() => handleFoodSelect(food)}
              >
                <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col space-y-3' : 'justify-between'}`}>
                  <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'text-center' : ''}`}>
                    <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col space-y-2' : 'gap-2'}`}>
                      <h4 className={`font-medium text-foreground text-brand-subheading ${viewMode === 'grid' ? 'text-center line-clamp-2' : 'line-clamp-1'}`} style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                        {food.description}
                      </h4>
                      {food.brandOwner && (
                        <Badge variant="outline" className="text-xs whitespace-nowrap text-brand-body">
                          {food.brandOwner}
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-4 mt-2 text-xs text-muted-foreground ${viewMode === 'grid' ? 'justify-center' : ''}`}>
                      <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        {Math.round(food.calories)} cal
                      </span>
                      <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        {Math.round(food.protein)}g protein
                      </span>
                      <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        {Math.round(food.carbs)}g carbs
                      </span>
                      <span className="text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                        {Math.round(food.fat)}g fat
                      </span>
                    </div>

                    {food.category && (
                      <Badge variant="secondary" className="mt-2 text-xs text-brand-body">
                        {food.category}
                      </Badge>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'w-full justify-between' : 'flex-shrink-0'}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(food.fdcId);
                      }}
                      className={`h-8 w-8 p-0 ${favorites.includes(food.fdcId) ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    >
                      <Star size={14} fill={favorites.includes(food.fdcId) ? 'currentColor' : 'none'} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToRecipeBuilder(food);
                      }}
                      className="h-8 w-8 p-0 text-primary"
                    >
                      <Plus size={14} />
                    </Button>
                    
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif", fontSize: "0.875rem", fontWeight: 400 }}>
              {searchQuery ? 'No foods found matching your search' : 'No foods available in this category'}
            </p>
          </div>
        )}
      </Card>

      {/* Selected Food Details Modal */}
      {selectedFood && (
        <Card className="p-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1.125rem", fontWeight: 600 }}>
              Food Details
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedFood(null)}
              className="h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-1 text-brand-subheading" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "1rem", fontWeight: 500 }}>
                {selectedFood.description}
              </h4>
              {selectedFood.brandOwner && (
                <p className="text-sm text-muted-foreground text-brand-body" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  Brand: {selectedFood.brandOwner}
                </p>
              )}
              <Badge variant="secondary" className="mt-1 text-brand-body">
                {selectedFood.category}
              </Badge>
            </div>

            {/* Nutrition Facts */}
            <div className="bg-muted/30 rounded-lg p-3">
              <h5 className="font-medium mb-3 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                Nutrition Facts (per 100g)
              </h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-body">Calories:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.calories)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-body">Protein:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-body">Carbs:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.carbs)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-body">Fat:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.fat)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-body">Fiber:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.fiber)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-body">Sugar:</span>
                  <span className="font-medium text-brand-body">{Math.round(selectedFood.sugar)}g</span>
                </div>
              </div>
            </div>

            {/* Available Portions */}
            {selectedFood.portions && selectedFood.portions.length > 0 && (
              <div>
                <h5 className="font-medium mb-2 text-brand-label" style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}>
                  Common Portions
                </h5>
                <div className="space-y-1">
                  {selectedFood.portions.map((portion, index) => (
                    <div key={index} className="flex justify-between text-sm bg-muted/20 rounded px-2 py-1">
                      <span className="text-brand-body">{portion.name}</span>
                      <span className="text-muted-foreground text-brand-body">{portion.gramWeight}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => addToRecipeBuilder(selectedFood)}
                className="flex-1 text-brand-button"
                style={{ fontFamily: "'Work Sans', sans-serif", fontSize: "0.875rem", fontWeight: 500 }}
              >
                <Plus size={16} className="mr-2" />
                Add to Recipe
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleFavorite(selectedFood.fdcId)}
                className={favorites.includes(selectedFood.fdcId) ? 'text-yellow-600 border-yellow-200' : ''}
              >
                <Star size={16} fill={favorites.includes(selectedFood.fdcId) ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default FoodDatabase;