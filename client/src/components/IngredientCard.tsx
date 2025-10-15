import React, { useState } from 'react';
import { Food } from '@shared/schema';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface IngredientCardProps {
  food: Food;
  onClick?: () => void;
  draggable?: boolean;
}

// Simple mock drag drop functions
const useDragDrop = () => ({
  startDrag: (food: any, element: any) => {},
  endDrag: () => {}
});

export function IngredientCard({ food, onClick, draggable = true }: IngredientCardProps) {
  const { startDrag, endDrag } = useDragDrop();
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggable) return;
    
    const element = e.currentTarget;
    setIsDragging(true);
    element.classList.add('dragging');
    startDrag(food, element);
  };

  const handleTouchEnd = () => {
    if (!draggable) return;
    
    setIsDragging(false);
    endDrag();
  };

  const handleClick = () => {
    if (!isDragging && onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className={`p-3 touch-target transition-all ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'scale-105 shadow-lg' : 'hover:shadow-md'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm truncate">{food.name}</h4>
            {food.verified && (
              <Badge variant="secondary" className="text-xs">
                ✓
              </Badge>
            )}
          </div>
          {food.brand && (
            <p className="text-xs text-muted-foreground">{food.brand}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {food.servingSize} • {Math.round(Number(food.calories))} cal
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium">
            {Math.round(Number(food.calories))} cal
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(Number(food.protein))}g protein
          </div>
        </div>
      </div>
    </Card>
  );
}
