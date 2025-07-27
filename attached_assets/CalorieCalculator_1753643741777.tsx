import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, ChefHat, X, Target, Calculator, Users, Clock, Sparkles, Zap, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';

// Enhanced measurement units system with more options
const MEASUREMENT_UNITS = [
  // Weight
  { id: 'g', name: 'Grams', shortName: 'g', type: 'weight', baseAmount: 1 },
  { id: 'kg', name: 'Kilograms', shortName: 'kg', type: 'weight', baseAmount: 1000 },
  { id: 'oz', name: 'Ounces', shortName: 'oz', type: 'weight', baseAmount: 28.35 },
  { id: 'lb', name: 'Pounds', shortName: 'lb', type: 'weight', baseAmount: 453.59 },
  
  // Volume
  { id: 'ml', name: 'Milliliters', shortName: 'mL', type: 'volume', baseAmount: 1 },
  { id: 'l', name: 'Liters', shortName: 'L', type: 'volume', baseAmount: 1000 },
  { id: 'cup', name: 'Cups', shortName: 'cup', type: 'volume', baseAmount: 240 },
  { id: 'tbsp', name: 'Tablespoons', shortName: 'tbsp', type: 'volume', baseAmount: 15 },
  { id: 'tsp', name: 'Teaspoons', shortName: 'tsp', type: 'volume', baseAmount: 5 },
  { id: 'fl_oz', name: 'Fluid Ounces', shortName: 'fl oz', type: 'volume', baseAmount: 29.57 },
  { id: 'pint', name: 'Pints', shortName: 'pt', type: 'volume', baseAmount: 473 },
  { id: 'quart', name: 'Quarts', shortName: 'qt', type: 'volume', baseAmount: 946 },
  
  // Count & Servings
  { id: 'piece', name: 'Pieces', shortName: 'pc', type: 'count', baseAmount: 1 },
  { id: 'whole', name: 'Whole', shortName: 'whole', type: 'count', baseAmount: 1 },
  { id: 'slice', name: 'Slices', shortName: 'slice', type: 'count', baseAmount: 1 },
  { id: 'serving', name: 'Servings', shortName: 'srv', type: 'serving', baseAmount: 100 },
  
  // Fractions
  { id: 'half', name: 'Half', shortName: '1/2', type: 'fraction', baseAmount: 0.5 },
  { id: 'third', name: 'Third', shortName: '1/3', type: 'fraction', baseAmount: 0.33 },
  { id: 'quarter', name: 'Quarter', shortName: '1/4', type: 'fraction', baseAmount: 0.25 },
  
  // Special
  { id: 'handful', name: 'Handful', shortName: 'handful', type: 'estimate', baseAmount: 30 },
  { id: 'pinch', name: 'Pinch', shortName: 'pinch', type: 'estimate', baseAmount: 0.5 },
  { id: 'dash', name: 'Dash', shortName: 'dash', type: 'estimate', baseAmount: 1 }
];

interface CalculatorIngredient {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  amount: number;
  unit: string;
  image: string;
  brand: string;
  category: string;
  clipArt?: string;
}

interface MealCategory {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: CalculatorIngredient[];
  icon: string;
  color: string;
}

// Comprehensive ingredient database with clip art focus
const CALCULATOR_INGREDIENTS = [
  // Proteins
  {
    id: 'calc_001',
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍗',
    brand: 'Fresh',
    category: 'Protein',
    commonServings: [
      { amount: 100, unit: 'g' },
      { amount: 1, unit: 'piece' },
      { amount: 6, unit: 'oz' }
    ]
  },
  {
    id: 'calc_002',
    name: 'Salmon Fillet',
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🐟',
    brand: 'Wild',
    category: 'Protein',
    commonServings: [
      { amount: 150, unit: 'g' },
      { amount: 1, unit: 'piece' },
      { amount: 5, unit: 'oz' }
    ]
  },
  {
    id: 'calc_003',
    name: 'Greek Yogurt',
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0,
    fiber: 0,
    sugar: 4,
    sodium: 65,
    baseAmount: 170,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥛',
    brand: 'Organic',
    category: 'Protein',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 170, unit: 'g' },
      { amount: 1, unit: 'half' }
    ]
  },
  {
    id: 'calc_004',
    name: 'Whole Eggs',
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥚',
    brand: 'Farm',
    category: 'Protein',
    commonServings: [
      { amount: 1, unit: 'piece' },
      { amount: 2, unit: 'piece' },
      { amount: 50, unit: 'g' }
    ]
  },
  {
    id: 'calc_005',
    name: 'Ground Beef',
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    sugar: 0,
    sodium: 78,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥩',
    brand: 'Grass Fed',
    category: 'Protein',
    commonServings: [
      { amount: 113, unit: 'g' },
      { amount: 4, unit: 'oz' },
      { amount: 1, unit: 'quarter' }
    ]
  },

  // Carbohydrates
  {
    id: 'calc_006',
    name: 'Brown Rice',
    calories: 123,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 1,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍚',
    brand: 'Organic',
    category: 'Carbs',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 150, unit: 'g' },
      { amount: 1, unit: 'half' }
    ]
  },
  {
    id: 'calc_007',
    name: 'Quinoa',
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    sodium: 7,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🌾',
    brand: 'Ancient',
    category: 'Carbs',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 185, unit: 'g' },
      { amount: 1, unit: 'third' }
    ]
  },
  {
    id: 'calc_008',
    name: 'Sweet Potato',
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0,
    fiber: 4,
    sugar: 5,
    sodium: 7,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1551516580-8834406b3e7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍠',
    brand: 'Fresh',
    category: 'Carbs',
    commonServings: [
      { amount: 1, unit: 'whole' },
      { amount: 128, unit: 'g' },
      { amount: 1, unit: 'cup' }
    ]
  },
  {
    id: 'calc_009',
    name: 'Whole Grain Bread',
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 4,
    fiber: 6,
    sugar: 6,
    sodium: 400,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍞',
    brand: 'Artisan',
    category: 'Carbs',
    commonServings: [
      { amount: 1, unit: 'slice' },
      { amount: 28, unit: 'g' },
      { amount: 2, unit: 'slice' }
    ]
  },
  {
    id: 'calc_010',
    name: 'Rolled Oats',
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    fiber: 11,
    sugar: 1,
    sodium: 2,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1517009808693-6ed6d9c5c785?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥣',
    brand: 'Organic',
    category: 'Carbs',
    commonServings: [
      { amount: 1, unit: 'half' },
      { amount: 40, unit: 'g' },
      { amount: 1, unit: 'third' }
    ]
  },

  // Healthy Fats
  {
    id: 'calc_011',
    name: 'Avocado',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    sugar: 0.7,
    sodium: 7,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥑',
    brand: 'Organic',
    category: 'Fats',
    commonServings: [
      { amount: 1, unit: 'whole' },
      { amount: 1, unit: 'half' },
      { amount: 150, unit: 'g' }
    ]
  },
  {
    id: 'calc_012',
    name: 'Olive Oil',
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    baseAmount: 100,
    baseUnit: 'ml',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🫒',
    brand: 'Premium',
    category: 'Fats',
    commonServings: [
      { amount: 1, unit: 'tbsp' },
      { amount: 1, unit: 'tsp' },
      { amount: 15, unit: 'ml' }
    ]
  },
  {
    id: 'calc_013',
    name: 'Almonds',
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    sugar: 4,
    sodium: 1,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🌰',
    brand: 'Raw',
    category: 'Fats',
    commonServings: [
      { amount: 1, unit: 'oz' },
      { amount: 23, unit: 'piece' },
      { amount: 28, unit: 'g' }
    ]
  },

  // Vegetables
  {
    id: 'calc_014',
    name: 'Spinach',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    sugar: 0.4,
    sodium: 79,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥬',
    brand: 'Organic',
    category: 'Vegetables',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 30, unit: 'g' },
      { amount: 2, unit: 'cup' }
    ]
  },
  {
    id: 'calc_015',
    name: 'Broccoli',
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥦',
    brand: 'Fresh',
    category: 'Vegetables',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 150, unit: 'g' },
      { amount: 1, unit: 'piece' }
    ]
  },
  {
    id: 'calc_016',
    name: 'Bell Peppers',
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.3,
    fiber: 2.5,
    sugar: 4.2,
    sodium: 4,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🫑',
    brand: 'Fresh',
    category: 'Vegetables',
    commonServings: [
      { amount: 1, unit: 'whole' },
      { amount: 119, unit: 'g' },
      { amount: 1, unit: 'cup' }
    ]
  },

  // Fruits
  {
    id: 'calc_017',
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍌',
    brand: 'Fresh',
    category: 'Fruits',
    commonServings: [
      { amount: 1, unit: 'whole' },
      { amount: 118, unit: 'g' },
      { amount: 1, unit: 'half' }
    ]
  },
  {
    id: 'calc_018',
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🍎',
    brand: 'Fresh',
    category: 'Fruits',
    commonServings: [
      { amount: 1, unit: 'whole' },
      { amount: 182, unit: 'g' },
      { amount: 1, unit: 'half' }
    ]
  },
  {
    id: 'calc_019',
    name: 'Berries',
    calories: 70,
    protein: 1,
    carbs: 16,
    fat: 0.3,
    fiber: 6,
    sugar: 10,
    sodium: 2,
    baseAmount: 100,
    baseUnit: 'g',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🫐',
    brand: 'Fresh',
    category: 'Fruits',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 150, unit: 'g' },
      { amount: 1, unit: 'half' }
    ]
  },

  // Dairy
  {
    id: 'calc_020',
    name: 'Milk',
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fat: 3.3,
    fiber: 0,
    sugar: 5.1,
    sodium: 43,
    baseAmount: 100,
    baseUnit: 'ml',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80&q=80',
    clipArt: '🥛',
    brand: 'Organic',
    category: 'Dairy',
    commonServings: [
      { amount: 1, unit: 'cup' },
      { amount: 240, unit: 'ml' },
      { amount: 8, unit: 'fl_oz' }
    ]
  }
];

// Touch-friendly drag backend options
const touchBackendOptions = {
  enableMouseEvents: true,
  delayTouchStart: 200,
  scrollAngleRanges: [
    { start: 30, end: 150 },
    { start: 210, end: 330 }
  ]
};

// Custom hook for auto-scroll during drag operations
function useAutoScroll() {
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const AUTO_SCROLL_ZONE_HEIGHT = 80; // pixels from top/bottom to trigger scroll
  const SCROLL_SPEED = 5; // pixels per interval
  const SCROLL_INTERVAL = 16; // 60fps
  
  const startAutoScroll = (direction: 'up' | 'down') => {
    if (autoScrollIntervalRef.current) return;
    
    console.log(`🎯 Starting auto-scroll: ${direction}`);
    setIsAutoScrolling(true);
    
    // Show helpful toast on first auto-scroll activation
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { 
        message: `Auto-scrolling ${direction} - drag near edges to scroll! 🎯`, 
        duration: 2000 
      }
    }));
    
    autoScrollIntervalRef.current = setInterval(() => {
      const scrollAmount = direction === 'up' ? -SCROLL_SPEED : SCROLL_SPEED;
      window.scrollBy({
        top: scrollAmount,
        behavior: 'instant'
      });
    }, SCROLL_INTERVAL);
  };
  
  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
  };
  
  useEffect(() => {
    if (!dragPosition) return;
    
    const viewportHeight = window.innerHeight;
    const { y } = dragPosition;
    
    // Check if drag is in auto-scroll zones
    if (y < AUTO_SCROLL_ZONE_HEIGHT) {
      // Near top - scroll up
      startAutoScroll('up');
    } else if (y > viewportHeight - AUTO_SCROLL_ZONE_HEIGHT) {
      // Near bottom - scroll down  
      startAutoScroll('down');
    } else {
      // In safe zone - stop auto-scroll
      stopAutoScroll();
    }
  }, [dragPosition]);
  
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);
  
  return {
    dragPosition,
    setDragPosition,
    isAutoScrolling,
    stopAutoScroll
  };
}

// Enhanced hook for global drag state communication with auto-scroll
function useDragCommunication() {
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const { dragPosition, setDragPosition, isAutoScrolling, stopAutoScroll } = useAutoScroll();
  
  useEffect(() => {
    const handleDragStart = () => {
      console.log('🎯 Drag started - enabling auto-scroll zones');
      setIsGlobalDragging(true);
      window.dispatchEvent(new CustomEvent('bytewise-drag-start'));
    };
    
    const handleDragEnd = () => {
      console.log('🎯 Drag ended - disabling auto-scroll');
      setIsGlobalDragging(false);
      setDragPosition(null);
      stopAutoScroll();
      window.dispatchEvent(new CustomEvent('bytewise-drag-end'));
    };

    // Track mouse/touch position during drag
    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isGlobalDragging) return;
      
      let clientY: number;
      if ('touches' in e) {
        clientY = e.touches[0]?.clientY || 0;
      } else {
        clientY = e.clientY;
      }
      
      setDragPosition({ x: 0, y: clientY });
    };

    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('drag', handleDragMove as EventListener);
    document.addEventListener('touchmove', handleDragMove as EventListener, { passive: true });
    
    // Touch handlers for mobile drag
    let touchStartY = 0;
    let touchStartTime = 0;
    let isDragOperation = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isDragOperation = false;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touchMoveY = e.touches[0].clientY;
      const touchDuration = Date.now() - touchStartTime;
      const touchDistance = Math.abs(touchMoveY - touchStartY);
      
      // Detect if this is likely a drag operation
      if (touchDuration > 150 && touchDistance > 10) {
        isDragOperation = true;
        if (isGlobalDragging) {
          setDragPosition({ x: 0, y: touchMoveY });
        }
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (isDragOperation && isGlobalDragging) {
        handleDragEnd();
      }
      isDragOperation = false;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('drag', handleDragMove as EventListener);
      document.removeEventListener('touchmove', handleDragMove as EventListener);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      stopAutoScroll();
    };
  }, [isGlobalDragging, setDragPosition, stopAutoScroll]);
  
  return {
    isGlobalDragging,
    isAutoScrolling,
    dragPosition
  };
}

// Enhanced Draggable Ingredient Component with Clip Art Layout
interface DraggableIngredientProps {
  ingredient: any;
  onAddToMeal: (ingredient: any, targetCategory?: string) => void;
  getEnhancedMealSuggestion?: (ingredient: any) => string;
}

function DraggableIngredient({ ingredient, onAddToMeal, getEnhancedMealSuggestion }: DraggableIngredientProps) {
  const [isDragPrepairing, setIsDragPrepairing] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'ingredient',
    item: () => {
      console.log(`🎯 Starting drag for: ${ingredient.name}`);
      setIsDragPrepairing(true);
      window.dispatchEvent(new CustomEvent('bytewise-drag-start'));
      return ingredient;
    },
    end: (item, monitor) => {
      console.log(`🎯 Ending drag for: ${ingredient.name}, dropped: ${monitor.didDrop()}`);
      setIsDragPrepairing(false);
      window.dispatchEvent(new CustomEvent('bytewise-drag-end'));
      
      // If not dropped on a valid target, show helpful message
      if (!monitor.didDrop()) {
        window.dispatchEvent(new CustomEvent('bytewise-toast', {
          detail: { 
            message: `Drag ${ingredient.name} to a meal category or use the + button`, 
            duration: 2000 
          }
        }));
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Get the standard serving for display
  const standardServing = ingredient.commonServings?.[0] || { amount: ingredient.baseAmount, unit: ingredient.baseUnit };
  const unitInfo = MEASUREMENT_UNITS.find(u => u.id === standardServing.unit) || MEASUREMENT_UNITS[0];

  return (
    <div
      ref={drag}
      className={`group relative rounded-lg overflow-hidden transition-all duration-200 bg-white border shadow-sm hover:shadow-md btn-animate ${
        isDragging 
          ? 'opacity-60 scale-95 z-50 rotate-1 cursor-grabbing dragging-item' 
          : isDragPrepairing
            ? 'opacity-80 scale-98 cursor-grabbing'
            : 'opacity-100 scale-100 hover:scale-[1.02] cursor-grab'
      }`}
      style={{ 
        touchAction: isDragging || isDragPrepairing ? 'none' : 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: isDragging ? 'none' : 'auto'
      }}
      onTouchStart={(e) => {
        // Record touch start time to differentiate between tap and drag
        setTouchStartTime(Date.now());
        console.log(`👆 Touch start on ${ingredient.name}`);
      }}
      onTouchMove={(e) => {
        // Track touch movement for auto-scroll
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration > 150 && (isDragPrepairing || isDragging)) {
          // This is likely a drag operation - let auto-scroll handle it
          console.log(`🎯 Touch drag detected for ${ingredient.name}`);
        }
      }}
      onTouchEnd={(e) => {
        // If it's a quick tap (less than 200ms), treat as click
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 200 && !isDragPrepairing && !isDragging && getEnhancedMealSuggestion) {
          // Quick tap - trigger smart add
          const smartCategory = getEnhancedMealSuggestion(ingredient);
          onAddToMeal(ingredient, smartCategory);
          
          // Provide feedback
          window.dispatchEvent(new CustomEvent('bytewise-toast', {
            detail: { 
              message: `${ingredient.name} added to ${smartCategory}! 🎯`, 
              duration: 2000 
            }
          }));
          
          console.log(`⚡ Quick add: ${ingredient.name} → ${smartCategory}`);
        }
      }}
      onDragStart={(e) => {
        console.log(`🎯 Drag start: ${ingredient.name}`);
        // Set drag image for better visual feedback
        const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
        dragImage.style.opacity = '0.8';
        document.body.appendChild(dragImage);
        e.dataTransfer?.setDragImage(dragImage, 50, 25);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }}
      onContextMenu={(e) => {
        // Prevent context menu on long press for better mobile experience
        e.preventDefault();
      }}
    >
      {/* Horizontal layout with clip art on left, text on right - Responsive width to fit container */}
      <div className="flex items-center brand-padding-sm h-[75px] w-full max-w-full">
        
        {/* Clip Art Section - Left side - Slightly smaller for narrow cards */}
        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-pastel-yellow/20 to-pastel-blue/10 flex items-center justify-center brand-spacing-sm border border-border/20">
          <span className="text-base" role="img" aria-label={ingredient.name}>
            {ingredient.clipArt || '🥘'}
          </span>
        </div>
        
        {/* Content Section - Right side - Optimized for narrow width */}
        <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--spacing-sm)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0" style={{ paddingRight: 'var(--spacing-xs)' }}>
              {/* Ingredient Name - Tighter spacing */}
              <h4 className="font-semibold text-foreground text-xs leading-tight truncate" style={{ marginBottom: 'var(--spacing-xs)' }}>
                {ingredient.name}
              </h4>
              
              {/* Nutrition info - More compact badges */}
              <div className="flex items-center brand-spacing-xs" style={{ marginBottom: 'var(--spacing-xs)' }}>
                <span className="bg-chart-4/20 text-chart-4 rounded-full text-xs font-medium border border-chart-4/30 brand-padding-xs">
                  {Math.round(ingredient.calories * (standardServing.amount / ingredient.baseAmount))}cal
                </span>
                <span className="bg-chart-2/20 text-chart-2 rounded-full text-xs font-medium border border-chart-2/30 brand-padding-xs">
                  {Math.round(ingredient.protein * (standardServing.amount / ingredient.baseAmount))}p
                </span>
              </div>
              
              {/* Serving size - Compact */}
              <div className="text-left">
                <span className="text-xs font-medium text-muted-foreground">
                  {standardServing.amount}{unitInfo.shortName}
                </span>
              </div>
            </div>
            
            {/* Smart Quick Add Button - Auto-assigns to appropriate meal */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Use enhanced smart assignment - no dialogs, just intelligent auto-assignment
                const smartCategory = getEnhancedMealSuggestion ? getEnhancedMealSuggestion(ingredient) : getSmartMealSuggestion(ingredient);
                onAddToMeal(ingredient, smartCategory);
              }}
              className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all btn-animate border border-primary/30 flex-shrink-0"
              style={{ marginLeft: 'var(--spacing-xs)' }}
              title={`Smart add to ${getEnhancedMealSuggestion ? getEnhancedMealSuggestion(ingredient) : 'meal'}`}
            >
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Category Badge - Floating on top right */}
        <div className="absolute top-1 right-1">
          <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-background/90 text-muted-foreground border border-border/50 backdrop-blur-sm">
            {ingredient.category}
          </Badge>
        </div>

        {/* Smart category indicator */}
        {!isDragging && getEnhancedMealSuggestion && (
          <div className="absolute bottom-1 left-1">
            <div className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity">
              {getEnhancedMealSuggestion(ingredient)}
            </div>
          </div>
        )}

        {/* Drag hint indicator */}
        {!isDragging && (
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-200 rounded-lg pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="text-primary drop-shadow-sm" size={12} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Meal Category Drop Zone with better measurement selector
interface MealCategoryProps {
  category: MealCategory;
  onDrop: (ingredient: any, categoryId: string) => void;
  onRemoveIngredient: (ingredientId: string, categoryId: string) => void;
  onUpdateAmount: (ingredientId: string, categoryId: string, amount: number) => void;
  onUpdateUnit: (ingredientId: string, categoryId: string, unit: string) => void;
}

function MealCategoryDropZone({ category, onDrop, onRemoveIngredient, onUpdateAmount, onUpdateUnit }: MealCategoryProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'ingredient',
    drop: (item: any) => {
      onDrop(item, category.id);
      window.dispatchEvent(new CustomEvent('bytewise-drag-end'));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const totalCalories = category.ingredients.reduce((sum, ing) => {
    const unitInfo = MEASUREMENT_UNITS.find(u => u.id === ing.unit) || MEASUREMENT_UNITS[0];
    const multiplier = (unitInfo.baseAmount * ing.amount) / ing.baseAmount || ing.amount / 100;
    return sum + (ing.calories * multiplier);
  }, 0);

  const getMealColors = (type: string) => {
    switch (type) {
      case 'breakfast': return { 
        bg: 'from-chart-4 to-chart-5', 
        border: 'border-chart-4/30',
        bgCard: 'bg-gradient-to-br from-chart-4/10 to-chart-5/5'
      };
      case 'lunch': return { 
        bg: 'from-chart-2 to-chart-3', 
        border: 'border-chart-2/30',
        bgCard: 'bg-gradient-to-br from-chart-2/10 to-chart-3/5'
      };
      case 'dinner': return { 
        bg: 'from-chart-3 to-primary', 
        border: 'border-chart-3/30',
        bgCard: 'bg-gradient-to-br from-chart-3/10 to-primary/5'
      };
      case 'snack': return { 
        bg: 'from-chart-1 to-chart-5', 
        border: 'border-chart-1/30',
        bgCard: 'bg-gradient-to-br from-chart-1/10 to-chart-5/5'
      };
      default: return { 
        bg: 'from-muted to-muted-foreground', 
        border: 'border-muted',
        bgCard: 'bg-muted/10'
      };
    }
  };

  const colors = getMealColors(category.type);

  return (
    <div
      ref={drop}
      className={`relative rounded-xl border-2 transition-all duration-300 min-h-[120px] shadow-sm ${colors.bgCard} ${
        isOver && canDrop 
          ? 'border-primary border-dashed bg-primary/10 scale-[1.02] shadow-lg' 
          : `${colors.border} hover:shadow-md`
      }`}
    >
      {/* Enhanced Header */}
      <div className={`bg-gradient-to-r ${colors.bg} text-white brand-padding-lg rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center brand-spacing-lg">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <p className="text-xs text-white/80">
                {category.ingredients.length} item{category.ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{Math.round(totalCalories)}</div>
            <div className="text-xs text-white/80">cal</div>
          </div>
        </div>
      </div>

      {/* Enhanced Drop Zone Indicator with Category Information */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center backdrop-blur-sm z-10">
          <div className="text-center text-primary animate-pulse">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 border-2 border-primary/30">
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">{category.icon}</span>
                <Plus size={16} />
              </div>
            </div>
            <p className="font-bold text-sm mb-1">Add to {category.name}</p>
            <p className="text-xs opacity-75">Drop ingredient here</p>
          </div>
        </div>
      )}

      {/* Enhanced Ingredients List with Clip Art Layout */}
      <div className="brand-padding-lg">
        {category.ingredients.length === 0 ? (
          <div className="text-center brand-padding-xl text-muted-foreground">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mx-auto" style={{ marginBottom: 'var(--spacing-sm)' }}>
              <Plus size={16} />
            </div>
            <p className="font-medium text-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>Empty meal</p>
            <p className="text-xs">Drag ingredients here</p>
          </div>
        ) : (
          <div className="tight-spacing max-h-48 overflow-y-auto hover-scroll-area">
            {category.ingredients.map((ingredient, index) => {
              const unitInfo = MEASUREMENT_UNITS.find(u => u.id === ingredient.unit) || MEASUREMENT_UNITS[0];
              const originalIngredient = CALCULATOR_INGREDIENTS.find(i => i.id === ingredient.id);
              const multiplier = (unitInfo.baseAmount * ingredient.amount) / ingredient.baseAmount || ingredient.amount / 100;
              
              return (
                <div key={`${ingredient.id}-${index}`} className="flex items-center justify-between bg-white/50 rounded-lg brand-padding-sm border border-border/20 backdrop-blur-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  {/* Left: Clip art and name */}
                  <div className="flex items-center brand-spacing-sm flex-1 min-w-0">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-pastel-yellow/30 to-pastel-blue/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs" role="img" aria-label={ingredient.name}>
                        {originalIngredient?.clipArt || '🥘'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-foreground truncate">{ingredient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(ingredient.calories * multiplier)}cal • {Math.round(ingredient.protein * multiplier)}p
                      </p>
                    </div>
                  </div>
                  
                  {/* Center: Amount controls */}
                  <div className="flex items-center brand-spacing-xs mx-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => onUpdateAmount(ingredient.id, category.id, Math.max(0.1, ingredient.amount - 0.5))}
                    >
                      <Minus size={10} />
                    </Button>
                    
                    <Input
                      type="number"
                      value={ingredient.amount}
                      onChange={(e) => onUpdateAmount(ingredient.id, category.id, Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-12 h-6 text-xs text-center border-0 bg-transparent p-0 font-medium"
                      step="0.1"
                      min="0.1"
                    />
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => onUpdateAmount(ingredient.id, category.id, ingredient.amount + 0.5)}
                    >
                      <Plus size={10} />
                    </Button>
                  </div>
                  
                  {/* Right: Unit selector and remove */}
                  <div className="flex items-center brand-spacing-xs">
                    <Select value={ingredient.unit} onValueChange={(value) => onUpdateUnit(ingredient.id, category.id, value)}>
                      <SelectTrigger className="w-12 h-6 text-xs border-0 bg-transparent p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {originalIngredient?.commonServings?.map((serving: any, servingIndex: number) => {
                          const unit = MEASUREMENT_UNITS.find(u => u.id === serving.unit);
                          return unit ? (
                            <SelectItem key={`${ingredient.id}-${serving.unit}-${servingIndex}`} value={serving.unit} className="text-xs">
                              {unit.shortName}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                      onClick={() => onRemoveIngredient(ingredient.id, category.id)}
                    >
                      <X size={10} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Nutrition Summary with clip art visual design
interface NutritionSummaryProps {
  categories: MealCategory[];
}

function NutritionSummary({ categories }: NutritionSummaryProps) {
  const totals = categories.reduce((acc, category) => {
    category.ingredients.forEach(ing => {
      const unitInfo = MEASUREMENT_UNITS.find(u => u.id === ing.unit) || MEASUREMENT_UNITS[0];
      const multiplier = (unitInfo.baseAmount * ing.amount) / ing.baseAmount || ing.amount / 100;
      
      acc.calories += ing.calories * multiplier;
      acc.protein += ing.protein * multiplier;
      acc.carbs += ing.carbs * multiplier;
      acc.fat += ing.fat * multiplier;
      acc.fiber += ing.fiber * multiplier;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const macroCards = [
    {
      icon: '🔥',
      label: 'Calories',
      value: Math.round(totals.calories),
      unit: 'cal',
      color: 'chart-4',
      bgColor: 'from-chart-4/20 to-chart-4/10'
    },
    {
      icon: '💪',
      label: 'Protein',
      value: Math.round(totals.protein),
      unit: 'g',
      color: 'chart-2',
      bgColor: 'from-chart-2/20 to-chart-2/10'
    },
    {
      icon: '🌾',
      label: 'Carbs',
      value: Math.round(totals.carbs),
      unit: 'g',
      color: 'chart-3',
      bgColor: 'from-chart-3/20 to-chart-3/10'
    },
    {
      icon: '🥑',
      label: 'Fat',
      value: Math.round(totals.fat),
      unit: 'g',
      color: 'chart-1',
      bgColor: 'from-chart-1/20 to-chart-1/10'
    }
  ];

  return (
    <div className="brand-card bg-gradient-to-br from-white to-background/50 border border-border/30 backdrop-blur-sm">
      <div className="brand-card-header">
        <div className="flex items-center brand-spacing-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Target size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Recipe Nutrition</h3>
            <p className="text-sm text-muted-foreground">Total macronutrient breakdown</p>
          </div>
        </div>
      </div>

      <div className="brand-card-content">
        <div className="grid grid-cols-2 gap-3">
          {macroCards.map((macro, index) => (
            <div
              key={index}
              className={`relative rounded-lg p-3 bg-gradient-to-br ${macro.bgColor} border border-border/20 overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center brand-spacing-sm">
                  <span className="text-lg" role="img" aria-label={macro.label}>
                    {macro.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{macro.label}</p>
                    <p className="text-sm font-bold text-foreground">
                      {macro.value}{macro.unit}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 w-8 h-8 opacity-10">
                <div className={`w-full h-full bg-${macro.color} rounded-full`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Calculator Props Interface
interface CalorieCalculatorProps {
  onNavigate: (tab: string) => void;
}

export function CalorieCalculator({ onNavigate }: CalorieCalculatorProps) {
  // Enhanced communication hook for drag state with auto-scroll
  const { isGlobalDragging, isAutoScrolling, dragPosition } = useDragCommunication();

  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([
    {
      id: 'breakfast',
      name: 'Breakfast',
      type: 'breakfast',
      ingredients: [],
      icon: '🌅',
      color: 'chart-4'
    },
    {
      id: 'lunch',
      name: 'Lunch',
      type: 'lunch',
      ingredients: [],
      icon: '☀️',
      color: 'chart-2'
    },
    {
      id: 'dinner',
      name: 'Dinner',
      type: 'dinner',
      ingredients: [],
      icon: '🌙',
      color: 'chart-3'
    },
    {
      id: 'snack',
      name: 'Snacks',
      type: 'snack',
      ingredients: [],
      icon: '🍿',
      color: 'chart-1'
    }
  ]);

  // Filter ingredients based on search and category
  const filteredIngredients = CALCULATOR_INGREDIENTS.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(CALCULATOR_INGREDIENTS.map(ing => ing.category)))];

  // Calculate total nutrition across all meals
  const totalNutrition = mealCategories.reduce((acc, category) => {
    category.ingredients.forEach(ing => {
      const unitInfo = MEASUREMENT_UNITS.find(u => u.id === ing.unit) || MEASUREMENT_UNITS[0];
      const multiplier = (unitInfo.baseAmount * ing.amount) / ing.baseAmount || ing.amount / 100;
      
      acc.calories += ing.calories * multiplier;
      acc.protein += ing.protein * multiplier;
      acc.carbs += ing.carbs * multiplier;
      acc.fat += ing.fat * multiplier;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Handle adding ingredient to meal category with proper target identification
  const handleAddToMeal = (ingredient: any, targetCategoryId?: string) => {
    // If no target category is specified, use a smart default or show selection modal
    const finalTargetId = targetCategoryId || getSmartMealSuggestion(ingredient);
    
    const standardServing = ingredient.commonServings?.[0] || { amount: ingredient.baseAmount, unit: ingredient.baseUnit };
    
    const newIngredient: CalculatorIngredient = {
      id: ingredient.id,
      name: ingredient.name,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
      fat: ingredient.fat,
      fiber: ingredient.fiber,
      sugar: ingredient.sugar,
      sodium: ingredient.sodium,
      amount: standardServing.amount,
      unit: standardServing.unit,
      image: ingredient.image,
      brand: ingredient.brand,
      category: ingredient.category,
      clipArt: ingredient.clipArt
    };

    setMealCategories(prev => prev.map(category => 
      category.id === finalTargetId
        ? { ...category, ingredients: [...category.ingredients, newIngredient] }
        : category
    ));

    // Show success feedback with correct category name
    const targetCategory = mealCategories.find(c => c.id === finalTargetId);
    window.dispatchEvent(new CustomEvent('bytewise-toast', {
      detail: { 
        message: `${ingredient.name} added to ${targetCategory?.name || 'meal'}! 🎯`, 
        duration: 2000 
      }
    }));
  };

  // Smart meal suggestion based on ingredient type and current time
  const getSmartMealSuggestion = (ingredient: any): string => {
    const currentHour = new Date().getHours();
    
    // Time-based suggestions
    if (currentHour >= 6 && currentHour < 11) {
      return 'breakfast';
    } else if (currentHour >= 11 && currentHour < 16) {
      return 'lunch';
    } else if (currentHour >= 16 && currentHour < 21) {
      return 'dinner';
    } else {
      return 'snack';
    }
  };

  // Enhanced smart meal suggestion with ingredient analysis
  const getEnhancedMealSuggestion = (ingredient: any): string => {
    const currentHour = new Date().getHours();
    const ingredientName = ingredient.name.toLowerCase();
    const category = ingredient.category.toLowerCase();
    
    // Breakfast-specific ingredients (6AM - 11AM)
    const breakfastKeywords = ['oat', 'egg', 'yogurt', 'milk', 'cereal', 'bread', 'banana'];
    const isBreakfastFood = breakfastKeywords.some(keyword => 
      ingredientName.includes(keyword) || category.includes(keyword)
    );
    
    // Dinner-specific ingredients (4PM - 9PM)  
    const dinnerKeywords = ['beef', 'chicken', 'salmon', 'rice', 'potato', 'broccoli'];
    const isDinnerFood = dinnerKeywords.some(keyword => 
      ingredientName.includes(keyword) || category.includes(keyword)
    );
    
    // Snack-specific ingredients
    const snackKeywords = ['almond', 'berry', 'apple', 'nuts'];
    const isSnackFood = snackKeywords.some(keyword => 
      ingredientName.includes(keyword) || category.includes(keyword)
    );
    
    // Smart assignment logic
    if (currentHour >= 6 && currentHour < 11) {
      // Morning: Prefer breakfast foods, but allow others
      return isBreakfastFood ? 'breakfast' : 'breakfast';
    } else if (currentHour >= 11 && currentHour < 16) {
      // Afternoon: Prefer lunch, snacks for small items
      if (isSnackFood) return 'snack';
      return 'lunch';
    } else if (currentHour >= 16 && currentHour < 21) {
      // Evening: Prefer dinner for proteins/mains, snacks for fruits
      if (isSnackFood) return 'snack';
      if (isDinnerFood) return 'dinner';
      return 'dinner';
    } else {
      // Late night/early morning: Default to snacks
      return isSnackFood ? 'snack' : 'snack';
    }
  };

  // Handle drag and drop with proper category identification
  const handleDrop = (ingredient: any, categoryId: string) => {
    console.log(`🎯 Ingredient "${ingredient.name}" dropped on category "${categoryId}"`);
    
    // Validate that the category exists
    const targetCategory = mealCategories.find(c => c.id === categoryId);
    if (!targetCategory) {
      console.error(`❌ Invalid drop target: "${categoryId}"`);
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: `Error: Invalid drop target`, duration: 2000 }
      }));
      return;
    }

    // Add ingredient to the correct category
    handleAddToMeal(ingredient, categoryId);
    
    console.log(`✅ Successfully added "${ingredient.name}" to "${targetCategory.name}"`);
  };

  // Handle removing ingredient
  const handleRemoveIngredient = (ingredientId: string, categoryId: string) => {
    setMealCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, ingredients: category.ingredients.filter(ing => ing.id !== ingredientId) }
        : category
    ));
  };

  // Handle updating amount
  const handleUpdateAmount = (ingredientId: string, categoryId: string, amount: number) => {
    setMealCategories(prev => prev.map(category =>
      category.id === categoryId
        ? {
            ...category,
            ingredients: category.ingredients.map(ing =>
              ing.id === ingredientId ? { ...ing, amount } : ing
            )
          }
        : category
    ));
  };

  // Handle updating unit
  const handleUpdateUnit = (ingredientId: string, categoryId: string, unit: string) => {
    setMealCategories(prev => prev.map(category =>
      category.id === categoryId
        ? {
            ...category,
            ingredients: category.ingredients.map(ing =>
              ing.id === ingredientId ? { ...ing, unit } : ing
            )
          }
        : category
    ));
  };

  // Save recipe functionality
  const handleSaveRecipe = () => {
    const hasIngredients = mealCategories.some(category => category.ingredients.length > 0);
    
    if (!hasIngredients) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Add some ingredients first!', duration: 3000 }
      }));
      return;
    }

    const recipeName = `Recipe ${new Date().toLocaleDateString()}`;
    const recipeData = {
      id: Date.now().toString(),
      name: recipeName,
      categories: mealCategories,
      totalNutrition,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      savedRecipes.push(recipeData);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: `${recipeName} saved successfully! 🎉`, duration: 3000 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('bytewise-toast', {
        detail: { message: 'Error saving recipe. Please try again.', duration: 3000 }
      }));
    }
  };

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend} options={isMobile ? touchBackendOptions : {}}>
      <div className="space-y-6 brand-padding-md relative">
        
        {/* Auto-scroll zone indicators */}
        {isGlobalDragging && (
          <>
            {/* Top auto-scroll zone */}
            <div 
              className={`fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none transition-all duration-200 ${
                dragPosition && dragPosition.y < 80 
                  ? 'bg-gradient-to-b from-primary/20 to-transparent border-b-2 border-primary/30' 
                  : 'bg-gradient-to-b from-primary/10 to-transparent'
              }`}
            >
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                  dragPosition && dragPosition.y < 80
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-primary/20 text-primary'
                }`}>
                  ↑ Auto-scroll up
                </div>
              </div>
            </div>
            
            {/* Bottom auto-scroll zone */}
            <div 
              className={`fixed bottom-0 left-0 right-0 h-20 z-40 pointer-events-none transition-all duration-200 ${
                dragPosition && dragPosition.y > window.innerHeight - 80
                  ? 'bg-gradient-to-t from-primary/20 to-transparent border-t-2 border-primary/30'
                  : 'bg-gradient-to-t from-primary/10 to-transparent'
              }`}
            >
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                  dragPosition && dragPosition.y > window.innerHeight - 80
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-primary/20 text-primary'
                }`}>
                  ↓ Auto-scroll down
                </div>
              </div>
            </div>
            
            {/* Active scroll indicator with direction */}
            {isAutoScrolling && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg animate-pulse border-2 border-primary">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span>
                      {dragPosition && dragPosition.y < 80 
                        ? '↑ Scrolling up...' 
                        : '↓ Scrolling down...'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll progress indicator */}
            {isGlobalDragging && dragPosition && (
              <div className="fixed top-1/4 right-4 z-50 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/30">
                  <div className="text-xs font-medium text-foreground mb-2 text-center">Drag Position</div>
                  <div className="w-4 h-32 bg-muted rounded-full relative overflow-hidden">
                    <div 
                      className="absolute left-0 right-0 bg-primary rounded-full transition-all duration-100"
                      style={{
                        height: '8px',
                        top: `${Math.max(0, Math.min(100, (dragPosition.y / window.innerHeight) * 100))}%`,
                        transform: 'translateY(-50%)'
                      }}
                    ></div>
                    {/* Auto-scroll zones indicators */}
                    <div className="absolute left-0 right-0 top-0 h-6 bg-primary/20 rounded-t-full"></div>
                    <div className="absolute left-0 right-0 bottom-0 h-6 bg-primary/20 rounded-b-full"></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    {Math.round((dragPosition.y / window.innerHeight) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Hero Section - Brand Compliant Header */}
        <div className="relative mb-8 -mx-3 overflow-hidden">
          <div className="relative h-64">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=256&q=80"
              alt="Fresh ingredients for cooking"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            
            <div className="absolute inset-0 flex flex-col justify-between items-center text-white brand-padding-xl py-8">
              {/* Top Section - Icon and Text */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30 shadow-2xl">
                  <Calculator className="text-white" size={28} />
                </div>
                <h1 style={{ fontFamily: "'League Spartan', sans-serif" }} className="text-3xl font-bold text-center mb-2">Recipe Builder</h1>
                <p style={{ fontFamily: "'Quicksand', sans-serif" }} className="text-white/90 text-center max-w-sm">
                  Drag ingredients to create perfectly balanced meals with precise nutrition tracking
                </p>
              </div>
              
              {/* Bottom Section - Quick Stats */}
              <div className="flex items-center brand-spacing-xl bg-black/30 backdrop-blur-md rounded-2xl brand-padding-xl">
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(totalNutrition.calories)}</div>
                  <div className="text-xs text-white/80">Calories</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(totalNutrition.protein)}</div>
                  <div className="text-xs text-white/80">Protein</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(totalNutrition.carbs)}</div>
                  <div className="text-xs text-white/80">Carbs</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round(totalNutrition.fat)}</div>
                  <div className="text-xs text-white/80">Fat</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="flex items-center brand-spacing-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border border-border/30 focus:border-primary"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 bg-white border border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Ingredients Library */}
          <div>
            <div className="space-y-2">
              <div className="flex items-center justify-between brand-padding-sm">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Ingredients Library</h3>
                  <p className="text-xs text-muted-foreground">Tap + for smart add • Long press & drag to choose meal</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {filteredIngredients.length} items
                </Badge>
              </div>
              
              {/* Quick instructions - Context aware */}
              <div className={`border rounded-lg px-3 py-2 mx-2 transition-all duration-300 ${
                isGlobalDragging 
                  ? 'bg-primary/20 border-primary/40' 
                  : 'bg-primary/10 border-primary/20'
              }`}>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Target size={12} />
                  {isGlobalDragging ? (
                    <span>Drag near screen edges to auto-scroll • Drop on meal categories</span>
                  ) : (
                    <span>Hover to see smart meal suggestion • Tap ingredients for instant add</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced scroll container with auto-scroll awareness */}
            <div className={`relative bg-background/50 rounded-xl brand-padding-lg border border-border/30 transition-all duration-200 ${
              isGlobalDragging ? 'ingredients-dragging' : 'ingredients-scrollable'
            }`}>
              <div 
                className={`flex flex-col compact-layout max-h-96 hover-scroll-area ingredients-scroll-area transition-all duration-200 ${
                  isGlobalDragging 
                    ? 'drag-scroll-enabled overflow-hidden' 
                    : 'overflow-y-auto overflow-x-hidden'
                }`}
                style={{
                  scrollBehavior: isGlobalDragging ? 'auto' : 'smooth',
                  touchAction: isGlobalDragging ? 'manipulation' : 'pan-y pinch-zoom',
                  userSelect: isGlobalDragging ? 'none' : 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
                onTouchStart={(e) => {
                  // Allow touch events during drag for auto-scroll
                  if (isGlobalDragging) {
                    // Don't prevent default - allow auto-scroll to work
                  }
                }}
                onTouchMove={(e) => {
                  // Allow controlled touch movement during drag
                  if (isGlobalDragging) {
                    // Let auto-scroll handle the movement
                    e.stopPropagation();
                  }
                }}
              >
                {filteredIngredients.map(ingredient => (
                  <div 
                    key={ingredient.id} 
                    className="w-full hover-scroll-item"
                    style={{
                      pointerEvents: isGlobalDragging ? 'none' : 'auto'
                    }}
                  >
                    <DraggableIngredient
                      ingredient={ingredient}
                      onAddToMeal={(ing, targetCategory) => handleAddToMeal(ing, targetCategory)}
                      getEnhancedMealSuggestion={getEnhancedMealSuggestion}
                    />
                  </div>
                ))}

                {filteredIngredients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No ingredients found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
              
              {/* Auto-scroll zones for drag operations */}
              {isGlobalDragging && (
                <>
                  <div className="scroll-zone-top" />
                  <div className="scroll-zone-bottom" />
                </>
              )}
              
              {/* Visual scroll hint for long lists */}
              {filteredIngredients.length > 6 && !isGlobalDragging && (
                <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none">
                  <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-primary/20">
                    ↕ Scroll for more
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meal Categories Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Meal Planning</h3>
              <p className="text-xs text-muted-foreground">Drop zones for organizing your ingredients</p>
            </div>
            <Button 
              onClick={handleSaveRecipe}
              className="bg-primary text-primary-foreground hover:bg-primary/90 btn-animate"
              size="sm"
            >
              <ChefHat size={16} className="mr-1" />
              Save Recipe
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {mealCategories.map(category => (
              <MealCategoryDropZone
                key={category.id}
                category={category}
                onDrop={handleDrop}
                onRemoveIngredient={handleRemoveIngredient}
                onUpdateAmount={handleUpdateAmount}
                onUpdateUnit={handleUpdateUnit}
              />
            ))}
          </div>
        </div>

        {/* Nutrition Summary */}
        <NutritionSummary categories={mealCategories} />

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 btn-animate"
            onClick={() => onNavigate('planner')}
          >
            <Calendar size={16} className="mr-2" />
            Plan Meals
          </Button>
          <Button
            variant="outline"
            className="flex-1 btn-animate"
            onClick={() => setMealCategories(prev => prev.map(cat => ({ ...cat, ingredients: [] })))}
          >
            <Trash2 size={16} className="mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </DndProvider>
  );
}