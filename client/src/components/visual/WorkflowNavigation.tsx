/**
 * Workflow Navigation Component
 * Clear visual workflow: Calculate → Log → Track → View → Export
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  PlusCircle, 
  BarChart3, 
  Eye, 
  Download,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  completed?: boolean;
  current?: boolean;
  action: () => void;
}

interface WorkflowNavigationProps {
  currentStep?: string;
  completedSteps?: string[];
  onStepClick: (stepId: string) => void;
  className?: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'calculate',
    label: 'Calculate',
    icon: Calculator,
    description: 'Calculate nutrition values',
    action: () => {}
  },
  {
    id: 'log',
    label: 'Log',
    icon: PlusCircle,
    description: 'Log your meals',
    action: () => {}
  },
  {
    id: 'track',
    label: 'Track',
    icon: BarChart3,
    description: 'Track your progress',
    action: () => {}
  },
  {
    id: 'view',
    label: 'View',
    icon: Eye,
    description: 'View your data',
    action: () => {}
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    description: 'Export your data',
    action: () => {}
  }
];

export function WorkflowNavigation({ 
  currentStep = 'calculate', 
  completedSteps = [], 
  onStepClick,
  className = '' 
}: WorkflowNavigationProps) {
  
  const getStepState = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepColors = (state: string) => {
    switch (state) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: 'text-green-600',
          text: 'text-green-800'
        };
      case 'current':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          icon: 'text-blue-600',
          text: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-400',
          text: 'text-gray-600'
        };
    }
  };

  return (
    <Card className={`p-4 bg-white/90 backdrop-blur-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Your Nutrition Workflow</h3>
        <p className="text-xs text-gray-600">Follow these steps to track your nutrition</p>
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        {workflowSteps.map((step, index) => {
          const state = getStepState(step.id);
          const colors = getStepColors(state);
          const IconComponent = step.icon;
          const isLast = index === workflowSteps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step Button */}
              <motion.button
                onClick={() => onStepClick(step.id)}
                className={`relative flex flex-col items-center p-2 rounded-lg border-2 ${colors.bg} ${colors.border} 
                           transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Completion Check */}
                {state === 'completed' && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                  </motion.div>
                )}
                
                {/* Current Step Pulse */}
                {state === 'current' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-blue-200"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                <div className="relative z-10">
                  <IconComponent className={`w-5 h-5 ${colors.icon} mb-1`} />
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {step.label}
                  </span>
                </div>
              </motion.button>
              
              {/* Arrow Connector */}
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current Step Description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-2 bg-blue-50 rounded-lg"
      >
        <p className="text-xs text-blue-800">
          {workflowSteps.find(step => step.id === currentStep)?.description}
        </p>
      </motion.div>
    </Card>
  );
}