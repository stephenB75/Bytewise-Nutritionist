/**
 * Food Image Gallery Component
 * 
 * Displays the provided food images in a beautiful gallery format
 * Used for showcasing available images and testing integration
 */

import { ImageWithFallback } from './ImageWithFallback';
import { FOOD_IMAGES } from '@/utils/foodImageRotation';
import { Card } from '@/components/ui/card';

interface FoodImageGalleryProps {
  className?: string;
  showLabels?: boolean;
  gridCols?: 2 | 3 | 4;
}

export function FoodImageGallery({ 
  className = '', 
  showLabels = true,
  gridCols = 3 
}: FoodImageGalleryProps) {
  const gridClass = `grid-cols-${gridCols}`;

  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {Object.entries(FOOD_IMAGES).map(([key, imageSrc]) => (
        <Card key={key} className="overflow-hidden hover:shadow-lg transition-shadow">
          <ImageWithFallback
            src={imageSrc}
            alt={`${key} food image`}
            className="w-full h-32 object-cover"
          />
          {showLabels && (
            <div className="p-2 bg-white">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}