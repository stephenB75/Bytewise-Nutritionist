import { useCallback, useEffect, useState } from 'react';
import Joyride, { CallBackProps, Step } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: '[data-testid="nav-dashboard"]',
    content: 'Your dashboard shows daily calories, macros, water, and fasting status.',
    disableBeacon: true,
  },
  {
    target: '[data-testid="daily-progress"]',
    content: 'Track calories against your goal as you log meals.',
  },
  {
    target: '[data-testid="water-consumption-card"]',
    content: 'Tap plus and minus to log glasses of water. The goal is 8 glasses a day.',
  },
  {
    target: '[data-testid="nav-calculator"]',
    content: 'Calorie Tracker has the Bytewise Calculator for searching and logging foods.',
  },
  {
    target: '[data-testid="nav-fasting"]',
    content: 'Start a fasting plan and watch the timer on this tab.',
  },
  {
    target: '[data-testid="nav-journal"]',
    content: 'Meal Journal lists everything you logged today and this week.',
  },
  {
    target: '[data-testid="nav-profile"]',
    content: 'Sign in, manage recipes, export data, and view achievements here.',
  },
];

export function AppTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const start = () => setRun(true);
    window.addEventListener('start-app-tour', start);
    return () => window.removeEventListener('start-app-tour', start);
  }, []);

  const handleCallback = useCallback((data: CallBackProps) => {
    const finished = data.status === 'finished' || data.status === 'skipped';
    if (finished) {
      setRun(false);
      localStorage.setItem('bytewise-tour-completed', 'true');
      window.dispatchEvent(new CustomEvent('tour-completed'));
    }
  }, []);

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#d97706',
          zIndex: 10000,
        },
      }}
    />
  );
}

export function startAppTour() {
  localStorage.removeItem('bytewise-tour-completed');
  window.dispatchEvent(new CustomEvent('start-app-tour'));
}
