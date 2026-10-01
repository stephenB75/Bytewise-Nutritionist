import { useCallback, useEffect, useRef, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from 'react-joyride';

type AppTourStep = Step & { tab?: string };

const TOUR_COMPLETED_KEY = 'bytewise-tour-completed';

const TOUR_STEPS: AppTourStep[] = [
  {
    tab: 'home',
    target: '[data-testid="nav-dashboard"]',
    title: 'Dashboard',
    content: 'Start here each day. The five tabs along the bottom take you to Tracker, Fasting, Journal, and Profile.',
    disableBeacon: true,
    disableScrolling: true,
    placement: 'top',
  },
  {
    tab: 'home',
    target: '[data-testid="daily-progress"]',
    title: 'Today’s calories',
    content: 'This card shows calories eaten versus your goal. It updates as you log meals.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    tab: 'home',
    target: '[data-testid="water-consumption-card"]',
    title: 'Water',
    content: 'Pick a size first. Each bar is that amount — 8, 16, 24, or 32 oz. Tap + to log one. The 30-day log shows what you drank each day.',
    disableBeacon: true,
    placement: 'top',
  },
  {
    tab: 'home',
    target: '[data-testid="apple-fitness-card"]',
    title: 'Apple Fitness',
    content: 'On iPhone, connect Apple Health in Profile to see steps, move calories, and exercise minutes here.',
    disableBeacon: true,
    placement: 'top',
  },
  {
    tab: 'nutrition',
    target: '[data-testid="nav-calculator"]',
    title: 'Tracker',
    content: 'This is where you log food — scan a barcode, search a meal, or pick a restaurant item.',
    disableBeacon: true,
    disableScrolling: true,
    placement: 'top',
  },
  {
    tab: 'nutrition',
    target: '[data-testid="packaged-food-scanner"]',
    title: 'Barcode & packaged foods',
    content: 'Scan a grocery barcode, type the numbers, or search snacks by name. Nutrition comes from the product label.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    tab: 'nutrition',
    target: '[data-testid="calorie-calculator"]',
    title: 'Food calculator',
    content: 'Type any dish and a serving size — curry and rice, a homemade plate, or leftovers — and get calories and macros.',
    disableBeacon: true,
    placement: 'top',
  },
  {
    tab: 'nutrition',
    target: '[data-testid="fastfood-menu"]',
    title: 'Popular fast food',
    content: 'Search a restaurant or meal (Pollo Tropical, La Granja, McDonald’s) and tap +. It shows up on Journal under Logged Today.',
    disableBeacon: true,
    placement: 'top',
  },
  {
    tab: 'fasting',
    target: '[data-testid="fasting-tracker"]',
    title: 'Fasting',
    content: 'Pick a plan, start a timer, and see progress on the dashboard while a fast is running.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    tab: 'daily',
    target: '[data-testid="journal-search"]',
    title: 'Journal',
    content: 'Everything you logged today is here. Search the last two weeks or tap an item to add it again.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    tab: 'profile',
    target: '[data-testid="nav-profile"]',
    title: 'Profile',
    content: 'Sign in to save meals, manage photos, connect Apple Health, and retake this tour anytime.',
    disableBeacon: true,
    disableScrolling: true,
    placement: 'top',
  },
];

function goToTab(tab?: string) {
  if (!tab) return;
  window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: { tab } }));
}

export function AppTour() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const retriesRef = useRef(0);

  useEffect(() => {
    const start = () => {
      retriesRef.current = 0;
      setStepIndex(0);
      goToTab(TOUR_STEPS[0].tab || 'home');
      window.setTimeout(() => setRun(true), 400);
    };
    window.addEventListener('start-app-tour', start);
    return () => window.removeEventListener('start-app-tour', start);
  }, []);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
      retriesRef.current = 0;
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      window.dispatchEvent(new CustomEvent('tour-completed'));
      return;
    }

    if (type === EVENTS.TARGET_NOT_FOUND && retriesRef.current < 3) {
      retriesRef.current += 1;
      goToTab(TOUR_STEPS[index]?.tab);
      window.setTimeout(() => setStepIndex(index), 550);
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const next = index + (action === ACTIONS.PREV ? -1 : 1);
      if (next < 0 || next >= TOUR_STEPS.length) return;
      retriesRef.current = 0;
      goToTab(TOUR_STEPS[next].tab);
      window.setTimeout(() => setStepIndex(next), 450);
    }
  }, []);

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress={false}
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      spotlightPadding={8}
      callback={handleCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip',
      }}
      styles={{
        options: {
          primaryColor: '#1f4aa6',
          zIndex: 10000,
          arrowColor: '#fffbeb',
          backgroundColor: '#fffbeb',
          textColor: '#111827',
        },
        tooltip: {
          borderRadius: 16,
          padding: 16,
          maxWidth: 360,
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 700,
          color: '#111827',
        },
        tooltipContent: {
          fontSize: 14,
          padding: '8px 0 4px',
        },
        buttonNext: {
          backgroundColor: '#1f4aa6',
          borderRadius: 999,
          fontSize: 13,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#1f4aa6',
          fontSize: 13,
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: 13,
        },
        beacon: {
          display: 'none',
        },
      }}
    />
  );
}

export function startAppTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  window.dispatchEvent(new CustomEvent('start-app-tour'));
}

export const TOUR_STORAGE_KEY = TOUR_COMPLETED_KEY;
