import { useState } from 'react';
import { ChefHat, Menu, Save, Share, Target, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Circular Progress Component with NaN protection
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
}

function CircularProgress({ percentage, size = 60, strokeWidth = 4, color = '#4ecdc4', label, value }: CircularProgressProps) {
  // Validate and sanitize inputs to prevent NaN
  const safeSize = isNaN(size) || size <= 0 ? 60 : size;
  const safeStrokeWidth = isNaN(strokeWidth) || strokeWidth <= 0 ? 4 : strokeWidth;
  const safePercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
  
  const radius = (safeSize - safeStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  // Additional validation for strokeDashoffset
  const safeStrokeDashoffset = isNaN(strokeDashoffset) ? circumference : strokeDashoffset;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={safeSize} height={safeSize} className="transform -rotate-90">
        <circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={safeStrokeWidth}
          fill="transparent"
        />
        <circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={safeStrokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={safeStrokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-foreground font-bold text-sm">{value || '0'}</span>
        {label && <span className="text-muted-foreground text-xs">{label}</span>}
      </div>
    </div>
  );
}

interface CustomRecipeBuilderHeaderProps {
  recipeName: string;
  onRecipeNameChange: (name: string) => void;
  servings: number;
  onServingsChange: (servings: number) => void;
  onSave: () => void;
  onShare: () => void;
  canSave?: boolean;
  canShare?: boolean;
}

export function CustomRecipeBuilderHeader({
  recipeName,
  onRecipeNameChange,
  servings,
  onServingsChange,
  onSave,
  onShare,
  canSave = false,
  canShare = false
}: CustomRecipeBuilderHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Safe servings handling
  const safeServings = isNaN(servings) || servings < 1 ? 1 : servings;

  const handleServingsDecrease = () => {
    const newServings = Math.max(1, safeServings - 1);
    onServingsChange(newServings);
  };

  const handleServingsIncrease = () => {
    const newServings = safeServings + 1;
    onServingsChange(newServings);
  };

  return (
    <div className="relative mb-6">
      <div className="relative h-48 -mx-4 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
          alt="Recipe building background"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 leading-tight">
            Recipe Builder
          </h1>
          <p className="text-white/80 text-center text-sm max-w-sm">
            Drag & drop ingredients to create perfect recipes
          </p>
        </div>
      </div>

      {/* Recipe Control Panel */}
      <div className="relative -mt-8 mx-4 z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
          {/* Header with Menu Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-8 w-8 p-0"
            >
              <Menu size={16} />
            </Button>
            
            <div className="text-center">
              <h2 className="font-semibold text-foreground">Build Recipe</h2>
              <p className="text-xs text-muted-foreground">Servings: {safeServings}</p>
            </div>
            
            <div className="w-8"></div>
          </div>

          {/* Collapsible Action Menu */}
          {isMenuOpen && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  disabled={!canSave}
                  className="justify-start text-xs"
                >
                  <Save size={12} className="mr-2" />
                  Save Recipe
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  disabled={!canShare}
                  className="justify-start text-xs"
                >
                  <Share size={12} className="mr-2" />
                  Share Recipe
                </Button>
              </div>
            </div>
          )}

          {/* Recipe Name and Servings Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Recipe Name</label>
              <Input
                placeholder="My Custom Recipe..."
                value={recipeName}
                onChange={(e) => onRecipeNameChange(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-xs text-muted-foreground flex-shrink-0">Servings:</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleServingsDecrease}
                  disabled={safeServings <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus size={12} />
                </Button>
                <span className="w-8 text-center font-semibold text-sm">{safeServings}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleServingsIncrease}
                  className="h-8 w-8 p-0"
                >
                  <Plus size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}