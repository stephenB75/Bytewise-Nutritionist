/**
 * Setup Progress Component
 * Shows real-time setup progress and helps users configure Supabase
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ExternalLink, RefreshCw } from 'lucide-react';
import { config } from '@/lib/config';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export function SetupProgress() {
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const setupSteps: SetupStep[] = [
      {
        id: 'supabase-account',
        title: 'Create Supabase Account',
        description: 'Sign up for a free Supabase account',
        completed: false,
        action: {
          label: 'Sign Up',
          url: 'https://supabase.com'
        }
      },
      {
        id: 'supabase-project',
        title: 'Create Project',
        description: 'Create a new Supabase project for Bytewise',
        completed: false,
      },
      {
        id: 'supabase-url',
        title: 'Add Project URL',
        description: 'Copy your project URL to Replit secrets',
        completed: !!config.supabase.url,
      },
      {
        id: 'supabase-key',
        title: 'Add API Key',
        description: 'Copy your anon key to Replit secrets',
        completed: !!config.supabase.anonKey,
      },
      {
        id: 'database-migration',
        title: 'Run Database Migration',
        description: 'Execute the SQL migration in Supabase',
        completed: false,
      },
      {
        id: 'test-connection',
        title: 'Test Connection',
        description: 'Verify your setup is working',
        completed: config.supabase.isConfigured,
        action: {
          label: 'Test Now',
          onClick: () => window.location.reload()
        }
      }
    ];

    setSteps(setupSteps);
    
    const completedSteps = setupSteps.filter(step => step.completed).length;
    setProgress((completedSteps / setupSteps.length) * 100);
  }, []);

  const handleStepAction = (step: SetupStep) => {
    if (step.action?.url) {
      window.open(step.action.url, '_blank');
    } else if (step.action?.onClick) {
      step.action.onClick();
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Setup Progress</h2>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">
          {Math.round(progress)}% complete
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start p-4 rounded-lg border ${
              step.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex-shrink-0 mr-4 mt-1">
              {step.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            <div className="flex-grow">
              <h3 className={`font-medium ${
                step.completed ? 'text-green-900' : 'text-gray-900'
              }`}>
                {index + 1}. {step.title}
              </h3>
              <p className={`text-sm mt-1 ${
                step.completed ? 'text-green-700' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
            </div>

            {step.action && !step.completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStepAction(step)}
                className="flex-shrink-0"
              >
                {step.action.url && <ExternalLink className="w-4 h-4 mr-1" />}
                {step.action.onClick && !step.action.url && <RefreshCw className="w-4 h-4 mr-1" />}
                {step.action.label}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Quick Setup Guide</h3>
        <p className="text-sm text-blue-800 mb-3">
          Follow the <code className="bg-blue-100 px-1 rounded">SUPABASE_QUICKSTART.md</code> file for detailed step-by-step instructions.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://supabase.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open Supabase
          </Button>
          <Button
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Check Status
          </Button>
        </div>
      </div>
    </Card>
  );
}