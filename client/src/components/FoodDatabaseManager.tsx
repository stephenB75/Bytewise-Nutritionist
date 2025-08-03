import { createContext, useContext, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface LocalFoodItem {
  fdcId: number;
  description: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  portions?: FoodPortion[];
}

export interface FoodPortion {
  id: string;
  name: string;
  gramWeight: number;
}

interface FoodDatabaseContextType {
  searchFoods: (query: string, limit?: number) => Promise<LocalFoodItem[]>;
  getFoodById: (id: number) => Promise<LocalFoodItem | null>;
  isLoading: boolean;
}

const FoodDatabaseContext = createContext<FoodDatabaseContextType | undefined>(undefined);

export function FoodDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const searchFoods = useCallback(async (query: string, limit: number = 20): Promise<LocalFoodItem[]> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/foods/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response as unknown as LocalFoodItem[];
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFoodById = useCallback(async (id: number): Promise<LocalFoodItem | null> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/foods/${id}`);
      return response as unknown as LocalFoodItem | null;
    } catch (error) {
      console.error('Error fetching food:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: FoodDatabaseContextType = {
    searchFoods,
    getFoodById,
    isLoading
  };

  return (
    <FoodDatabaseContext.Provider value={value}>
      {children}
    </FoodDatabaseContext.Provider>
  );
}

export function useFoodDatabase() {
  const context = useContext(FoodDatabaseContext);
  if (context === undefined) {
    throw new Error('useFoodDatabase must be used within a FoodDatabaseProvider');
  }
  return context;
}