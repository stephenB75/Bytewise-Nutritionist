/**
 * Fasting Tracker Component - Intermittent Fasting Support
 * Features: Popular fasting schedules, timer tracking, meal windows, and suggestions
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame,
  Coffee,
  Utensils,
  Moon,
  Sun,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FastingPlan {
  id: string;
  name: string;
  description: string;
  fastingHours: number;
  eatingHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  suggestedSchedule: string;
}

interface FastingSession {
  id?: string;
  planId: string;
  startTime: Date;
  endTime?: Date;
  targetDuration: number;
  status: 'active' | 'completed' | 'paused';
}

const FASTING_PLANS: FastingPlan[] = [
  {
    id: '16-8',
    name: '16:8 Method',
    description: '16 hours fasting, 8 hours eating window',
    fastingHours: 16,
    eatingHours: 8,
    difficulty: 'Beginner',
    benefits: ['Weight loss', 'Improved metabolism', 'Better sleep'],
    suggestedSchedule: 'Fast: 8 PM - 12 PM | Eat: 12 PM - 8 PM'
  },
  {
    id: '14-10',
    name: '14:10 Method',
    description: '14 hours fasting, 10 hours eating window',
    fastingHours: 14,
    eatingHours: 10,
    difficulty: 'Beginner',
    benefits: ['Gentle introduction', 'Improved digestion', 'Better energy'],
    suggestedSchedule: 'Fast: 7 PM - 9 AM | Eat: 9 AM - 7 PM'
  },
  {
    id: '18-6',
    name: '18:6 Method',
    description: '18 hours fasting, 6 hours eating window',
    fastingHours: 18,
    eatingHours: 6,
    difficulty: 'Intermediate',
    benefits: ['Enhanced fat burning', 'Mental clarity', 'Cellular repair'],
    suggestedSchedule: 'Fast: 6 PM - 12 PM | Eat: 12 PM - 6 PM'
  },
  {
    id: '20-4',
    name: '20:4 Warrior',
    description: '20 hours fasting, 4 hours eating window',
    fastingHours: 20,
    eatingHours: 4,
    difficulty: 'Advanced',
    benefits: ['Maximum autophagy', 'Deep ketosis', 'Hormone optimization'],
    suggestedSchedule: 'Fast: 8 PM - 4 PM | Eat: 4 PM - 8 PM'
  },
  {
    id: '24-0',
    name: '24 Hour Fast',
    description: 'Complete 24-hour fasting period',
    fastingHours: 24,
    eatingHours: 0,
    difficulty: 'Advanced',
    benefits: ['Deep cellular cleanup', 'Growth hormone boost', 'Mental discipline'],
    suggestedSchedule: 'Dinner to dinner or lunch to lunch'
  }
];

const FASTING_TIPS = [
  "Start your fast after your last meal of the day",
  "Stay hydrated with water, black coffee, or plain tea",
  "Keep busy during hunger waves - they usually pass",
  "Break your fast gently with nutritious whole foods",
  "Listen to your body and adjust as needed",
  "Consider electrolytes for longer fasts",
  "Plan your eating window around your lifestyle"
];

// Constants for localStorage keys
const FASTING_SESSION_KEY = 'bytewise_fasting_session';
const FASTING_ACTIVE_KEY = 'bytewise_fasting_active';
const FASTING_HISTORY_KEY = 'bytewise_fasting_history';
const FASTING_MILESTONES_KEY = 'bytewise_fasting_milestones';

// Fasting milestone hours (in hours)
const MILESTONE_HOURS = [8, 12, 16, 18, 20, 24, 36, 48, 72];

const FastingTracker = React.memo(function FastingTracker() {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FASTING_PLANS[0]);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();



  // Get user's fasting history (combine server and local)
  const { data: serverHistory, isLoading, error: historyError } = useQuery({
    queryKey: ['/api/fasting/history'],
    queryFn: () => apiRequest('GET', '/api/fasting/history').then(res => res.json()),
    retry: 1,
    staleTime: 30000 // Cache for 30 seconds
  });
  
  // Merge server history with local history
  const fastingHistory = useMemo(() => {
    let localHistory: any[] = [];
    try {
      localHistory = JSON.parse(localStorage.getItem(FASTING_HISTORY_KEY) || '[]');
      } catch (e) {
      // Failed to parse local fasting history, using empty array
      localHistory = [];
    }
    
    const serverData = Array.isArray(serverHistory) ? serverHistory : [];

    
    // Combine and deduplicate by id
    const combined = [...localHistory, ...serverData];
    const seen = new Set();
    const unique = combined.filter((session: any) => {
      // Handle sessions without IDs (local sessions)
      if (!session.id) {
        // Create a temporary unique identifier for deduplication
        const tempId = `${session.planId}_${session.startTime}_${session.status}`;
        if (seen.has(tempId)) return false;
        seen.add(tempId);
        return true;
      }
      
      // Handle sessions with IDs (server sessions)
      if (seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    });
    
    // Sort by date (most recent first)
    const sorted = unique.sort((a: any, b: any) => {
      const dateA = new Date(a.completedAt || a.endTime || a.createdAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.endTime || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    

    return sorted;
  }, [serverHistory]);

  // Get active fasting session from server on mount
  const { data: activeFastingSession } = useQuery({
    queryKey: ['/api/fasting/active'],
    queryFn: () => apiRequest('GET', '/api/fasting/active').then(res => res.json()),
    enabled: !currentSession, // Only fetch if we don't have a local session
    retry: 1,
    staleTime: 10000 // Cache for 10 seconds
  });

  // Start fasting session mutation
  const startFastingMutation = useMutation({
    mutationFn: (session: Omit<FastingSession, 'id'> & { planName?: string }) => 
      apiRequest('POST', '/api/fasting/start', session).then(res => res.json()),
    onSuccess: (data) => {
      // Update the stored session with the ID from the server
      const updatedSession = {
        ...currentSession,
        id: data.id
      };
      setCurrentSession(updatedSession as FastingSession);
      localStorage.setItem(FASTING_SESSION_KEY, JSON.stringify(updatedSession));
      
      toast({
        title: "Fasting Started! 🚀",
        description: `Your ${selectedPlan.name} session has begun. Stay strong and hydrated!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/active'] });
    },
    onError: (error) => {
      // Keep the timer running even if API fails - it's stored locally
      toast({
        title: "Offline Mode",
        description: "Timer started locally. We'll sync when you're back online.",
      });
    }
  });

  // Complete fasting session mutation
  const completeFastingMutation = useMutation({
    mutationFn: (sessionId: string) => 
      apiRequest('PUT', `/api/fasting/${sessionId}/complete`),
    onSuccess: (data) => {

      
      // Store completed session in local history
      if (currentSession) {
        const now = new Date();
        const startTime = new Date(currentSession.startTime);
        const actualDuration = now.getTime() - startTime.getTime();
        
        const completedSession = {
          ...currentSession,
          status: 'completed',
          completedAt: now.toISOString(),
          endTime: now.toISOString(),
          actualDuration: actualDuration,
          // Ensure we have planName for display
          planName: (currentSession as any).planName || selectedPlan.name,
          // Add hours for easier display calculations
          targetHours: (currentSession.targetDuration || 0) / (1000 * 60 * 60),
          actualHoursFasted: actualDuration / (1000 * 60 * 60),
          wasCompleted: true
        };
        

        
        // Add to local history
        try {
          const existingHistory = JSON.parse(localStorage.getItem(FASTING_HISTORY_KEY) || '[]');
          // Remove any duplicate session if it exists
          const filteredHistory = existingHistory.filter((s: any) => 
            s.id !== completedSession.id && s.startTime !== completedSession.startTime
          );
          filteredHistory.unshift(completedSession);
          // Keep only last 10 sessions in local storage
          const finalHistory = filteredHistory.slice(0, 10);
          localStorage.setItem(FASTING_HISTORY_KEY, JSON.stringify(finalHistory));
        } catch (e) {
          // Failed to save to localStorage
        }
      }
      
      // Clear current session from localStorage
      localStorage.removeItem(FASTING_SESSION_KEY);
      localStorage.removeItem(FASTING_ACTIVE_KEY);
      
      setCurrentSession(null);
      setIsActive(false);
      setTimeRemaining(0);
      toast({
        title: "Fasting Complete! 🎉",
        description: "Great job! You can now break your fast with a nutritious meal.",
      });
      
      // Force refresh the history
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/active'] });
      
      // Check for new achievements after completing fast
      fetch('/api/achievements/check', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.newAchievements && data.newAchievements.length > 0) {
            // Trigger achievement celebration
            window.dispatchEvent(new CustomEvent('achievement-unlocked', {
              detail: data.newAchievements[0]
            }));
          }
        })
        .catch(err => {
          // Achievement check failed silently - non-critical for user experience
        });
    },
    onError: (error: any) => {

      
      // Even if API fails, store the completed session locally
      if (currentSession) {
        const now = new Date();
        const startTime = new Date(currentSession.startTime);
        const actualDuration = now.getTime() - startTime.getTime();
        
        const completedSession = {
          ...currentSession,
          status: 'completed',
          completedAt: now.toISOString(),
          endTime: now.toISOString(),
          actualDuration: actualDuration,
          // Ensure we have planName for display
          planName: (currentSession as any).planName || selectedPlan.name,
          // Add hours for easier display calculations
          targetHours: (currentSession.targetDuration || 0) / (1000 * 60 * 60),
          actualHoursFasted: actualDuration / (1000 * 60 * 60),
          wasCompleted: true,
          // Mark as locally stored only
          localOnly: true
        };
        

        
        // Add to local history
        try {
          const existingHistory = JSON.parse(localStorage.getItem(FASTING_HISTORY_KEY) || '[]');
          // Remove any duplicate session if it exists
          const filteredHistory = existingHistory.filter((s: any) => 
            s.id !== completedSession.id && s.startTime !== completedSession.startTime
          );
          filteredHistory.unshift(completedSession);
          const finalHistory = filteredHistory.slice(0, 10);
          localStorage.setItem(FASTING_HISTORY_KEY, JSON.stringify(finalHistory));
        } catch (e) {
          // Failed to save to localStorage
        }
      }
      
      localStorage.removeItem(FASTING_SESSION_KEY);
      localStorage.removeItem(FASTING_ACTIVE_KEY);
      setCurrentSession(null);
      setIsActive(false);
      setTimeRemaining(0);
      toast({
        title: "Session Ended",
        description: "Your fasting session has been completed locally. We'll sync when you're back online.",
      });
    }
  });

  // Load fasting session from localStorage on mount and sync with server
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const storedSession = localStorage.getItem(FASTING_SESSION_KEY);
        const storedActive = localStorage.getItem(FASTING_ACTIVE_KEY);
        
        if (storedSession) {
          const session = JSON.parse(storedSession) as FastingSession;
          const startTime = new Date(session.startTime).getTime();
          const now = Date.now();
          const elapsed = now - startTime;
          const remaining = session.targetDuration - elapsed;
          
          if (remaining > 0) {
            // Session is still valid
            setCurrentSession(session);
            setTimeRemaining(remaining);
            setIsActive(storedActive === 'true');
            
            // Restore milestone tracking
            const storedMilestones = localStorage.getItem(FASTING_MILESTONES_KEY);
            if (storedMilestones) {
              try {
                const milestones = JSON.parse(storedMilestones);
                setCompletedMilestones(milestones);
              } catch (e) {
                setCompletedMilestones([]);
              }
            }
            
            // Find and set the corresponding plan
            const plan = FASTING_PLANS.find(p => p.id === session.planId);
            if (plan) {
              setSelectedPlan(plan);
            }
          } else {
            // Session has expired, clear it
            localStorage.removeItem(FASTING_SESSION_KEY);
            localStorage.removeItem(FASTING_ACTIVE_KEY);
            localStorage.removeItem(FASTING_MILESTONES_KEY);
            
            // If there was an id, complete the session
            if (session.id) {
              completeFastingMutation.mutate(session.id);
            }
          }
        }
      } catch (error) {
        // Clear corrupt data
        localStorage.removeItem(FASTING_SESSION_KEY);
        localStorage.removeItem(FASTING_ACTIVE_KEY);
      }
    };
    
    loadStoredSession();
  }, []);

  // Sync with server active session if localStorage is empty
  useEffect(() => {
    if (activeFastingSession && !currentSession) {
      const startTime = new Date(activeFastingSession.startTime).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = activeFastingSession.targetDuration - elapsed;
      
      if (remaining > 0) {
        // Restore session from server
        const session: FastingSession = {
          id: activeFastingSession.id,
          planId: activeFastingSession.planId,
          startTime: new Date(activeFastingSession.startTime),
          targetDuration: activeFastingSession.targetDuration,
          status: activeFastingSession.status
        };
        
        // Store in localStorage for persistence
        localStorage.setItem(FASTING_SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(FASTING_ACTIVE_KEY, 'true');
        
        // Update state
        setCurrentSession(session);
        setTimeRemaining(remaining);
        setIsActive(true);
        
        // Find and set the corresponding plan
        const plan = FASTING_PLANS.find(p => p.id === session.planId);
        if (plan) {
          setSelectedPlan(plan);
        }
      }
    }
  }, [activeFastingSession, currentSession]);

  // Check for milestone achievements
  const checkMilestones = (elapsed: number, milestones: number[]) => {
    const elapsedHours = elapsed / (1000 * 60 * 60);
    
    MILESTONE_HOURS.forEach(milestoneHour => {
      // Check if we've reached this milestone and haven't celebrated it yet
      if (elapsedHours >= milestoneHour && !milestones.includes(milestoneHour)) {
        // Add to completed milestones
        const newMilestones = [...milestones, milestoneHour];
        setCompletedMilestones(newMilestones);
        localStorage.setItem(FASTING_MILESTONES_KEY, JSON.stringify(newMilestones));
        
        // Celebrate the milestone
        celebrateMilestone(milestoneHour);
      }
    });
  };

  const celebrateMilestone = (hours: number) => {
    let title = "";
    let description = "";
    let celebration = "🎉";
    
    switch(hours) {
      case 8:
        title = "8-Hour Milestone! ⏰";
        description = "Great progress! You've completed 8 hours of fasting. Your body is starting to enter a deeper fasted state.";
        celebration = "⭐";
        break;
      case 12:
        title = "Half-Day Champion! 🌟"; 
        description = "Incredible! 12 hours down. Your body is now in fat-burning mode and cellular repair is ramping up.";
        celebration = "🔥";
        break;
      case 16:
        title = "16-Hour Hero! 🏆";
        description = "Amazing achievement! You've completed the classic 16:8 fast. Maximum autophagy and metabolic benefits unlocked!";
        celebration = "💪";
        break;
      case 18:
        title = "18-Hour Warrior! ⚔️";
        description = "Outstanding dedication! 18 hours shows serious commitment. Your mental clarity should be at its peak.";
        celebration = "🚀";
        break;
      case 20:
        title = "20-Hour Legend! 👑";
        description = "Exceptional willpower! You've reached the warrior level. Deep ketosis and cellular rejuvenation in full swing.";
        celebration = "🎯";
        break;
      case 24:
        title = "24-Hour Master! 🌟";
        description = "Extraordinary accomplishment! A full day of fasting. You've achieved peak autophagy and metabolic flexibility.";
        celebration = "🏅";
        break;
      case 36:
        title = "36-Hour Champion! 💎";
        description = "Incredible discipline! Extended fasting for cellular renewal and deep metabolic reset achieved.";
        celebration = "💫";
        break;
      case 48:
        title = "48-Hour Legend! 🦅";
        description = "Phenomenal achievement! Two full days show ultimate dedication to health and self-mastery.";
        celebration = "🔮";
        break;
      case 72:
        title = "72-Hour Master! 🏔️";
        description = "Ultimate fasting achievement! Three days of discipline unlock maximum health benefits and mental strength.";
        celebration = "👑";
        break;
      default:
        title = `${hours}-Hour Milestone! ${celebration}`;
        description = `Fantastic progress! You've completed ${hours} hours of fasting. Keep up the amazing work!`;
    }

    // Show celebratory toast
    toast({
      title,
      description,
      duration: 6000,
    });

    // Trigger celebration event for other components
    window.dispatchEvent(new CustomEvent('fasting-milestone', {
      detail: {
        hours,
        title,
        description,
        celebration,
        message: `${title} - ${description}`
      }
    }));

    // Check for achievements
    fetch('/api/achievements/check', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.newAchievements && data.newAchievements.length > 0) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', {
            detail: data.newAchievements[0]
          }));
        }
      })
      .catch(() => {
        // Achievement check failed - non-critical
      });
  };

  // Timer effect with localStorage persistence and milestone tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentSession) {
      interval = setInterval(() => {
        // Calculate time remaining based on actual elapsed time
        const startTime = new Date(currentSession.startTime).getTime();
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = currentSession.targetDuration - elapsed;
        
        // Only check milestones every 30 seconds to reduce performance impact
        if (Math.floor(elapsed / 1000) % 30 === 0) {
          checkMilestones(elapsed, completedMilestones);
        }
        
        if (remaining <= 0) {
          // Fast complete - celebrate the final achievement
          const targetHours = currentSession.targetDuration / (1000 * 60 * 60);
          if (targetHours >= 8) {
            toast({
              title: `${Math.round(targetHours)}-Hour Fast Complete! 🎉`,
              description: "Congratulations! You've successfully completed your fasting goal. Time to break your fast with a nutritious meal.",
              duration: 8000,
            });
          }
          
          // Dispatch fasting completion event for notifications
          window.dispatchEvent(new CustomEvent('fasting-completed', {
            detail: {
              planName: selectedPlan.name,
              duration: Math.round(targetHours),
              message: `You completed a ${Math.round(targetHours)}-hour ${selectedPlan.name} fast! Time to break your fast with a nutritious meal.`
            }
          }));
          
          setTimeRemaining(0);
          localStorage.removeItem(FASTING_SESSION_KEY);
          localStorage.removeItem(FASTING_ACTIVE_KEY);
          localStorage.removeItem(FASTING_MILESTONES_KEY);
          setCompletedMilestones([]);
          
          if (currentSession.id) {
            completeFastingMutation.mutate(currentSession.id);
          }
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentSession, completedMilestones]);

  const startFasting = () => {
    const targetDuration = selectedPlan.fastingHours * 60 * 60 * 1000; // Convert to milliseconds
    const session: Omit<FastingSession, 'id'> = {
      planId: selectedPlan.id,
      startTime: new Date(),
      targetDuration,
      status: 'active'
    };
    
    // Reset milestone tracking for new session
    setCompletedMilestones([]);
    localStorage.removeItem(FASTING_MILESTONES_KEY);
    
    // Store session in localStorage immediately
    localStorage.setItem(FASTING_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(FASTING_ACTIVE_KEY, 'true');
    
    // Set timer immediately for visual feedback
    setTimeRemaining(targetDuration);
    setCurrentSession(session as FastingSession);
    setIsActive(true);
    
    // Start the session via API (this will update with the ID when successful)
    startFastingMutation.mutate({
      ...session,
      planName: selectedPlan.name
    });
  };

  const pauseFasting = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    
    // Update localStorage with pause state
    localStorage.setItem(FASTING_ACTIVE_KEY, newActiveState.toString());
    
    if (!newActiveState && currentSession) {
      // When pausing, update the session with remaining time
      const updatedSession = {
        ...currentSession,
        status: 'paused' as const
      };
      setCurrentSession(updatedSession);
      localStorage.setItem(FASTING_SESSION_KEY, JSON.stringify(updatedSession));
    } else if (newActiveState && currentSession) {
      // When resuming, update status
      const updatedSession = {
        ...currentSession,
        status: 'active' as const
      };
      setCurrentSession(updatedSession);
      localStorage.setItem(FASTING_SESSION_KEY, JSON.stringify(updatedSession));
    }
    
    toast({
      title: isActive ? "Fasting Paused" : "Fasting Resumed",
      description: isActive ? "Take your time and resume when ready." : "Keep going! You've got this!",
    });
  };

  const stopFasting = () => {

    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "There's no active fasting session to stop.",
        duration: 4000,
      });
      return;
    }
    
    // Calculate actual time fasted and remaining time
    const startTime = new Date(currentSession.startTime).getTime();
    const now = Date.now();
    const actualTimeFasted = now - startTime;
    const actualHoursFasted = actualTimeFasted / (1000 * 60 * 60);
    const targetHours = selectedPlan.fastingHours;
    const remainingTime = currentSession.targetDuration - actualTimeFasted;
    const remainingHours = Math.max(0, remainingTime / (1000 * 60 * 60));
    

    
    const isCompleted = remainingTime <= 0;
    
    // Format time for display
    const formatHours = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.floor((hours - h) * 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };
    
    // Create session summary for storage
    const sessionSummary = {
      id: currentSession.id || `local_${Date.now()}`, // Ensure we have an ID
      ...currentSession,
      status: isCompleted ? 'completed' : 'stopped',
      endTime: new Date().toISOString(),
      completedAt: new Date().toISOString(), // Add completedAt field for display
      actualDuration: actualTimeFasted,
      actualHoursFasted: actualHoursFasted,
      targetHours: targetHours,
      wasCompleted: isCompleted,
      remainingHours: isCompleted ? 0 : remainingHours,
      planName: selectedPlan.name // Ensure planName is saved
    };
    
    // Store in history if any meaningful time was fasted (5 seconds for testing)
    if (actualTimeFasted >= 5000) { // 5 second threshold for testing
      try {
        const existingHistory = JSON.parse(localStorage.getItem(FASTING_HISTORY_KEY) || '[]');
        existingHistory.unshift(sessionSummary);
        localStorage.setItem(FASTING_HISTORY_KEY, JSON.stringify(existingHistory.slice(0, 20))); // Keep last 20 sessions
      } catch (e) {
        // Failed to store session in history
      }
    } else {

    }
    
    // Clear current session localStorage
    localStorage.removeItem(FASTING_SESSION_KEY);
    localStorage.removeItem(FASTING_ACTIVE_KEY);
    localStorage.removeItem(FASTING_MILESTONES_KEY);
    
    // Reset local state
    setCurrentSession(null);
    setIsActive(false);
    setTimeRemaining(0);
    setCompletedMilestones([]);
    
    // Show detailed feedback to user
    if (isCompleted) {
      toast({
        title: "Fasting Completed! 🎉",
        description: `Congratulations! You completed your ${formatHours(actualHoursFasted)} fast successfully.`,
        duration: 8000,
      });
    } else {
      // Show what they accomplished and what was left - ALWAYS show this for testing
      const accomplishedText = actualHoursFasted >= 1 ? 
        `You fasted for ${formatHours(actualHoursFasted)}` : 
        actualTimeFasted >= 60000 ? // More than 1 minute
        `You fasted for ${Math.floor(actualTimeFasted / (1000 * 60))} minutes` :
        actualTimeFasted >= 1000 ? // More than 1 second
        `You fasted for ${Math.floor(actualTimeFasted / 1000)} seconds` :
        `You fasted for ${actualTimeFasted}ms`;
      
      const remainingText = remainingHours > 0 ? 
        ` with ${formatHours(remainingHours)} remaining from your ${targetHours}h goal.` : 
        ` from your ${targetHours}h goal.`;
      

      
      toast({
        title: "Fasting Session Ended",
        description: accomplishedText + remainingText,
        duration: 8000,
      });
    }
    
    // Complete the session via API if it has an ID
    if (currentSession?.id) {
      completeFastingMutation.mutate(currentSession.id);
    }
    
    // Invalidate queries to refresh history
    queryClient.invalidateQueries({ queryKey: ['/api/fasting/history'] });
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-orange-100 text-orange-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gradient-to-br from-amber-100 to-amber-200 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!currentSession || timeRemaining === 0) return 100;
    const totalTime = selectedPlan.fastingHours * 60 * 60 * 1000;
    return Math.max(0, ((totalTime - timeRemaining) / totalTime) * 100);
  };

  return (
    <div className="space-y-8 pb-24" data-testid="fasting-tracker">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intermittent Fasting</h2>
          <p className="text-gray-700">Track your fasting journey and optimize your health</p>
        </div>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent border-0 shadow-none ring-0">
          <TabsTrigger value="tracker" data-testid="tab-tracker" className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-900 bg-transparent border-0 shadow-none outline-none focus:outline-none ring-0 focus:ring-0 data-[state=active]:bg-amber-200/70 data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-0 active:scale-95 active:bg-amber-300/80 transition-all duration-150">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
            <span className="hidden xs:inline text-gray-900">Tracker</span>
            <span className="xs:hidden text-gray-900">Track</span>
          </TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-plans" className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-900 bg-transparent border-0 shadow-none outline-none focus:outline-none ring-0 focus:ring-0 data-[state=active]:bg-amber-200/70 data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-0 active:scale-95 active:bg-amber-300/80 transition-all duration-150">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="tips" data-testid="tab-tips" className="flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-900 bg-transparent border-0 shadow-none outline-none focus:outline-none ring-0 focus:ring-0 data-[state=active]:bg-amber-200/70 data-[state=active]:text-gray-900 data-[state=active]:shadow-none data-[state=active]:border-0 active:scale-95 active:bg-amber-300/80 transition-all duration-150">
            <Coffee className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900" />
            Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-8 mt-6">
          {/* Current Fasting Session */}
          <Card data-testid="fasting-session-card" className="mb-8 bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    {isActive ? (
                      <Flame className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-500" />
                    )}
                    {selectedPlan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-700">{selectedPlan.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(selectedPlan.difficulty)}>
                  {selectedPlan.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Timer Display */}
              <div className="text-center space-y-6 py-4">
                <div className="text-4xl font-mono font-black text-gray-900">
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-3 [&>div]:bg-orange-500"
                  data-testid="fasting-progress"
                />
                <p className="text-sm text-gray-700">
                  {isActive ? 'Time remaining in your fast' : 'Ready to start fasting'}
                </p>
              </div>

              {/* Control Buttons */}
              <div data-testid="fasting-controls" className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 py-2">
                {!isActive && !currentSession ? (
                  <Button 
                    onClick={startFasting}
                    size="lg"
                    className="gap-2 w-full sm:w-auto min-w-[140px] text-white"
                    data-testid="button-start-fasting"
                    disabled={startFastingMutation.isPending}
                  >
                    <Play className="w-4 h-4" />
                    {startFastingMutation.isPending ? "Starting..." : "Start Fasting"}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={pauseFasting}
                      variant="outline"
                      size="lg"
                      className="gap-2 w-full sm:w-auto min-w-[120px] bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                      data-testid="button-pause-fasting"
                    >
                      {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button 
                      onClick={stopFasting}
                      variant="destructive"
                      size="lg"
                      className="gap-2 w-full sm:w-auto min-w-[120px]"
                      data-testid="button-stop-fasting"
                    >
                      <RotateCcw className="w-4 h-4" />
                      End Fast
                    </Button>
                  </>
                )}
              </div>

              {/* Schedule Display */}
              <div className="bg-amber-100/50 rounded-lg p-6 mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900">
                  <Sun className="w-4 h-4 text-gray-900" />
                  Suggested Schedule
                </h4>
                <p className="text-sm text-gray-900">{selectedPlan.suggestedSchedule}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fasting History */}
          <Card className="mt-8 bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-gray-900" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-700">Loading history...</p>
                </div>
              ) : fastingHistory && Array.isArray(fastingHistory) && fastingHistory.length > 0 ? (
                <div className="space-y-4">

                  {fastingHistory
                    .filter((session: any) => session.status === 'completed' || session.status === 'stopped')
                    .slice(0, 8)
                    .map((session: any, index: number) => {
                      const duration = session.actualDuration || session.targetDuration || 0;
                      const actualHours = session.actualHoursFasted || (duration / (1000 * 60 * 60));
                      const targetHours = session.targetHours || session.targetDuration / (1000 * 60 * 60) || 16; // fallback to 16h
                      const wasCompleted = session.status === 'completed' || session.wasCompleted;
                      const remainingHours = session.remainingHours || Math.max(0, targetHours - actualHours);
                      const sessionDate = session.completedAt || session.endTime || session.createdAt;
                      

                      
                      const formatHours = (hours: number) => {
                        const h = Math.floor(hours);
                        const m = Math.floor((hours - h) * 60);
                        return h > 0 ? `${h}h ${m}m` : `${m}m`;
                      };
                      
                      return (
                        <div 
                          key={session.id || index}
                          className="flex items-center justify-between p-3 bg-amber-100/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {wasCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{session.planName || `${Math.round(targetHours)}h Fasting Session`}</p>
                              <p className="text-sm text-gray-700">
                                {sessionDate ? new Date(sessionDate).toLocaleDateString() : 'N/A'}
                              </p>
                              {!wasCompleted && remainingHours > 0 && (
                                <p className="text-xs text-orange-700 mt-1">
                                  {formatHours(remainingHours)} remaining from {targetHours}h goal
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={wasCompleted ? "secondary" : "outline"} className={wasCompleted ? "bg-green-600 text-white" : "bg-orange-100 text-orange-700 border-none"}>
                              {formatHours(actualHours)} {wasCompleted ? 'completed' : 'fasted'}
                            </Badge>
                            {!wasCompleted && (
                              <p className="text-xs text-gray-700 mt-1">
                                of {targetHours}h goal
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {fastingHistory.filter((session: any) => session.status === 'completed' || session.status === 'stopped').length === 0 && (
                    <div className="text-center py-6">
                      <Coffee className="w-8 h-8 mx-auto text-gray-700 mb-2" />
                      <p className="text-sm text-gray-700">No fasting sessions yet</p>
                      <p className="text-xs text-gray-700 mt-1">Start your first fast to see it here!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Coffee className="w-8 h-8 mx-auto text-gray-700 mb-2" />
                  <p className="text-sm text-gray-700">No fasting history yet</p>
                  <p className="text-xs text-gray-700 mt-1">Start your first fast to build your history!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6 mt-6">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {FASTING_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none ${
                  selectedPlan.id === plan.id ? 'bg-gradient-to-br from-amber-100 to-amber-200' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
                data-testid={`plan-card-${plan.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">{plan.name}</CardTitle>
                    <Badge className={getDifficultyColor(plan.difficulty)}>
                      {plan.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-700">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Moon className="w-4 h-4 text-blue-500" />
                        <span>{plan.fastingHours}h fast</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Utensils className="w-4 h-4 text-green-500" />
                        <span>{plan.eatingHours}h eating</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-900">Benefits:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-600 text-white border-none">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-none">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Coffee className="w-5 h-5 text-gray-900" />
                Fasting Tips & Guidelines
              </CardTitle>
              <CardDescription className="text-gray-700">
                Expert advice to make your fasting journey successful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {FASTING_TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-amber-100/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed text-gray-900">{tip}</p>
                </div>
              ))}
              
              <Alert className="mt-6 bg-amber-100/50 border-none text-gray-900">
                <AlertCircle className="h-4 w-4 text-gray-900" />
                <AlertDescription className="text-gray-900">
                  <strong>Important:</strong> Consult with a healthcare provider before starting any fasting regimen, 
                  especially if you have medical conditions, are pregnant, or taking medications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export { FastingTracker };
export default FastingTracker;