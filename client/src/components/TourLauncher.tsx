import { ScanBarcode, Calculator, Store, Droplets, Timer, BookOpen } from 'lucide-react';

export const TOUR_STORAGE_KEY = 'bytewise-tour-completed';

export const KEY_TOOLS = [
  {
    id: 'barcode',
    title: 'Scan barcode',
    description: 'Packaged snacks, drinks, and groceries',
    tab: 'nutrition',
    scrollTo: 'packaged-food-scanner',
    icon: ScanBarcode,
  },
  {
    id: 'calculator',
    title: 'Food calculator',
    description: 'Any dish and serving size',
    tab: 'nutrition',
    scrollTo: 'calorie-calculator',
    icon: Calculator,
  },
  {
    id: 'fastfood',
    title: 'Fast food',
    description: 'Restaurant menus with calories',
    tab: 'nutrition',
    scrollTo: 'fastfood-menu',
    icon: Store,
  },
  {
    id: 'water',
    title: 'Water',
    description: 'Glasses, bottles, and daily log',
    tab: 'home',
    scrollTo: 'water-consumption-card',
    icon: Droplets,
  },
  {
    id: 'fasting',
    title: 'Fasting',
    description: 'Timer and fasting plan',
    tab: 'fasting',
    scrollTo: 'fasting-tracker',
    icon: Timer,
  },
  {
    id: 'journal',
    title: 'Journal',
    description: 'Today’s meals and search',
    tab: 'daily',
    scrollTo: 'journal-search',
    icon: BookOpen,
  },
] as const;

export function useAppTour() {
  const shouldShowTour = () => localStorage.getItem(TOUR_STORAGE_KEY) !== 'true';

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    localStorage.removeItem('tour-cards-clicked');
    localStorage.removeItem('tour-progress');
  };

  const startTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('start-app-tour'));
  };

  const dismissTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  return { shouldShowTour, resetTour, startTour, dismissTour };
}
