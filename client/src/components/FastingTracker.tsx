/**
 * Fasting Tracker Component - Intermittent Fasting Support
 * Features: Popular fasting schedules, timer tracking, meal windows, and suggestions
 */

import React, { useState, useEffect } from 'react';
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

export function FastingTracker() {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FASTING_PLANS[0]);
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's fasting history
  const { data: fastingHistory, isLoading } = useQuery({
    queryKey: ['/api/fasting/history'],
    queryFn: () => apiRequest('GET', '/api/fasting/history').then(res => res.json())
  });

  // Start fasting session mutation
  const startFastingMutation = useMutation({
    mutationFn: (session: Omit<FastingSession, 'id'> & { planName?: string }) => 
      apiRequest('POST', '/api/fasting/start', session).then(res => res.json()),
    onSuccess: (data) => {
      setCurrentSession(data);
      setIsActive(true);
      toast({
        title: "Fasting Started! 🚀",
        description: `Your ${selectedPlan.name} session has begun. Stay strong and hydrated!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/history'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start",
        description: "Please try again. Make sure you're signed in.",
        variant: "destructive"
      });
      // Reset timer if API call failed
      setTimeRemaining(0);
    }
  });

  // Complete fasting session mutation
  const completeFastingMutation = useMutation({
    mutationFn: (sessionId: string) => 
      apiRequest('PUT', `/api/fasting/${sessionId}/complete`),
    onSuccess: () => {
      setCurrentSession(null);
      setIsActive(false);
      setTimeRemaining(0);
      toast({
        title: "Fasting Complete! 🎉",
        description: "Great job! You can now break your fast with a nutritious meal.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fasting/history'] });
      
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
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentSession && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            // Fast complete
            completeFastingMutation.mutate(currentSession.id!);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentSession, timeRemaining]);

  const startFasting = () => {
    const targetDuration = selectedPlan.fastingHours * 60 * 60 * 1000; // Convert to milliseconds
    const session: Omit<FastingSession, 'id'> = {
      planId: selectedPlan.id,
      startTime: new Date(),
      targetDuration,
      status: 'active'
    };
    
    // Set timer immediately for visual feedback
    setTimeRemaining(targetDuration);
    
    // Start the session via API
    startFastingMutation.mutate({
      ...session,
      planName: selectedPlan.name
    });
  };

  const pauseFasting = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Fasting Paused" : "Fasting Resumed",
      description: isActive ? "Take your time and resume when ready." : "Keep going! You've got this!",
    });
  };

  const stopFasting = () => {
    if (currentSession?.id) {
      completeFastingMutation.mutate(currentSession.id);
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Intermittent Fasting</h2>
          <p className="text-muted-foreground">Track your fasting journey and optimize your health</p>
        </div>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="tracker" data-testid="tab-tracker" className="flex items-center justify-center gap-1 text-xs sm:text-sm">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Tracker</span>
            <span className="xs:hidden">Track</span>
          </TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-plans" className="flex items-center justify-center gap-1 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="tips" data-testid="tab-tips" className="flex items-center justify-center gap-1 text-xs sm:text-sm">
            <Coffee className="w-3 h-3 sm:w-4 sm:h-4" />
            Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-8 mt-6">
          {/* Current Fasting Session */}
          <Card data-testid="fasting-session-card" className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {isActive ? (
                      <Flame className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-500" />
                    )}
                    {selectedPlan.name}
                  </CardTitle>
                  <CardDescription>{selectedPlan.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(selectedPlan.difficulty)}>
                  {selectedPlan.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Timer Display */}
              <div className="text-center space-y-6 py-4">
                <div className="text-4xl font-mono font-bold text-primary">
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-3"
                  data-testid="fasting-progress"
                />
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Time remaining in your fast' : 'Ready to start fasting'}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 py-2">
                {!isActive && !currentSession ? (
                  <Button 
                    onClick={startFasting}
                    size="lg"
                    className="gap-2 w-full sm:w-auto min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
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
                      className="gap-2 w-full sm:w-auto min-w-[120px]"
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
              <div className="bg-muted rounded-lg p-6 mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Suggested Schedule
                </h4>
                <p className="text-sm">{selectedPlan.suggestedSchedule}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fasting History */}
          {fastingHistory && Array.isArray(fastingHistory) && fastingHistory.length > 0 && (
            <Card className="mt-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fastingHistory.slice(0, 5).map((session: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium">{session.planName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(session.duration / (1000 * 60 * 60))}h
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-6 mt-6">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {FASTING_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan.id === plan.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlan(plan)}
                data-testid={`plan-card-${plan.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge className={getDifficultyColor(plan.difficulty)}>
                      {plan.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
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
                      <p className="text-sm font-medium mb-2">Benefits:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
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
          <Card>
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Fasting Tips & Guidelines
              </CardTitle>
              <CardDescription>
                Expert advice to make your fasting journey successful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {FASTING_TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
              
              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
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
}