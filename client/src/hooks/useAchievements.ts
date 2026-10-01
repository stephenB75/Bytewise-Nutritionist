import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Achievement {
  id: number;
  userId: string;
  achievementType: string;
  title: string;
  description: string | null;
  iconName: string | null;
  colorClass: string | null;
  earnedAt: string;
  createdAt: string | null;
}

export function useAchievements(enabled = true) {
  return useQuery({
    queryKey: ['/api/achievements'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/achievements');
      const data = await response.json();
      return data.achievements as Achievement[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/achievements/check');
      return response.json();
    },
    onSuccess: () => {
      // Refresh achievements list
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
    },
  });
}

export function getAchievementIcon(iconName: string | null) {
  const iconMap: Record<string, string> = {
    'target': '🎯',
    'flame': '🔥', 
    'zap': '⚡',
    'utensils': '🍽️',
    'calendar': '📅',
    'trophy': '🏆',
    'star': '⭐',
    'medal': '🥇'
  };
  
  return iconMap[iconName || 'star'] || '🎯';
}

export function formatAchievementDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return 'Today';
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}