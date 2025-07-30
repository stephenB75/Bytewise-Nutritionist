/**
 * Bytewise App Constants
 * 
 * Centralized constants and mappings for the application
 * Features:
 * - Page title mappings
 * - Navigation constants
 * - System status defaults
 * - Application metadata
 */

import { SystemStatus } from './DevTools';

// Page title mappings
export const PAGE_TITLES = {
  dashboard: 'Dashboard',
  calculator: 'Recipe Builder',
  planner: 'Meal Planner',
  calendar: 'Progress Calendar',
  profile: 'Profile & Settings'
} as const;

// Authentication modes
export const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot'
} as const;

// Default system status
export const DEFAULT_SYSTEM_STATUS: SystemStatus = {
  auth: false,
  storage: false,
  navigation: false,
  dragDrop: false,
  notifications: false,
  userManager: false
};

// Toast message durations
export const TOAST_DURATIONS = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
} as const;

// Achievement trigger delays
export const ACHIEVEMENT_DELAYS = {
  EARLY_ADOPTER: 2000,
  PROFILE_UPDATE: 500
} as const;

// Navigation tabs
export const NAV_TABS = {
  DASHBOARD: 'dashboard',
  CALCULATOR: 'calculator',
  PLANNER: 'planner',
  CALENDAR: 'calendar',
  PROFILE: 'profile'
} as const;

// App metadata
export const APP_METADATA = {
  NAME: 'Bytewise',
  TAGLINE: 'Nutritionist',
  VERSION: '1.0.0',
  DESCRIPTION: 'Ingredient-level nutrition tracking app'
} as const;

// Layout constants
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: '4rem',
  FOOTER_HEIGHT: '7rem',
  MAX_WIDTH: '32rem', // max-w-lg
  HERO_HEIGHT: '16rem' // h-64
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  HERO: 600
} as const;

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px'
} as const;

// Z-index levels
export const Z_INDEX = {
  HEADER: 50,
  MODAL: 90,
  CONFETTI: 100,
  DRAG_OVERLAY: 30,
  FOOTER: 40,
  TOAST: 50
} as const;

// Brand colors (matching CSS variables)
export const BRAND_COLORS = {
  PASTEL_YELLOW: '#fef7cd',
  PASTEL_BLUE: '#a8dadc', 
  PASTEL_BLUE_DARK: '#89c4c7',
  BLACK: '#1d1d1b',
  WHITE: '#ffffff'
} as const;

// Font families (matching brand guidelines)
export const FONTS = {
  HEADING: "'League Spartan', sans-serif",
  SUBHEADING: "'Work Sans', sans-serif", 
  BODY: "'Quicksand', sans-serif",
  BUTTON: "'Work Sans', sans-serif",
  LABEL: "'Work Sans', sans-serif"
} as const;

// Typography scales
export const FONT_SIZES = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  BASE: '1rem',     // 16px
  LG: '1.125rem',   // 18px
  XL: '1.25rem',    // 20px
  '2XL': '1.5rem',  // 24px
  '3XL': '1.875rem' // 30px
} as const;

// Spacing scale (matching Tailwind)
export const SPACING = {
  XS: '0.125rem',   // 2px
  SM: '0.25rem',    // 4px
  MD: '0.5rem',     // 8px
  LG: '0.75rem',    // 12px
  XL: '1rem',       // 16px
  '2XL': '1.25rem', // 20px
  '3XL': '1.5rem',  // 24px
  '4XL': '2rem'     // 32px
} as const;

// Event names for custom events
export const CUSTOM_EVENTS = {
  USER_LOGIN: 'bytewise-user-login',
  USER_SIGNUP: 'bytewise-user-signup',
  USER_LOGOUT: 'bytewise-clear-user-data',
  RECIPE_CREATED: 'bytewise-recipe-created',
  MEAL_LOGGED: 'bytewise-meal-logged',
  GOAL_COMPLETED: 'bytewise-goal-completed',
  PROFILE_UPDATED: 'bytewise-profile-updated',
  ACHIEVEMENT_UNLOCKED: 'bytewise-achievement-unlocked',
  CONFETTI_TRIGGER: 'bytewise-confetti',
  TOAST_SHOW: 'bytewise-toast',
  CHECK_ACHIEVEMENTS: 'bytewise-check-achievements'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH: 'bytewise-auth',
  USER: 'bytewise-user', 
  USER_PROFILE: 'bytewise-user-profile',
  USDA_FOODS: 'bytewise-usda-foods',
  FOOD_DATABASE: 'bytewise-food-database',
  LAST_SYNC: 'bytewise-db-last-sync'
} as const;

// API endpoints (placeholder for future use)
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  USER_PROFILE: '/api/user/profile',
  FOOD_SEARCH: '/api/food/search',
  USDA_DATA: '/api/food/usda'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please log in again.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back! 🌟',
  SIGNUP: 'Welcome to Bytewise! 🎉',
  PROFILE_UPDATED: 'Profile updated successfully! ✅',
  RECIPE_CREATED: 'Recipe created successfully! 🍳',
  MEAL_LOGGED: 'Meal logged successfully! 🍽️',
  GOAL_COMPLETED: 'Goal completed! 🎯',
  DATA_EXPORTED: 'Data exported successfully! 📥',
  PASSWORD_CHANGED: 'Password changed successfully! 🔐'
} as const;

// Feature flags (for future use)
export const FEATURE_FLAGS = {
  ACHIEVEMENTS: true,
  CONFETTI: true,
  DEV_TOOLS: true,
  ANALYTICS: false,
  SOCIAL_FEATURES: false,
  PREMIUM_FEATURES: false
} as const;

// Validation rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  FOOD_SEARCH_LIMIT: 50
} as const;

// Session configuration
export const SESSION_CONFIG = {
  TIMEOUT_HOURS: 24,
  REFRESH_THRESHOLD_MINUTES: 30,
  MAX_INACTIVE_MINUTES: 60
} as const;

// Responsive breakpoint helpers
export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 640;
export const isMediumScreen = () => typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024;
export const isLargeScreen = () => typeof window !== 'undefined' && window.innerWidth >= 1024;

// Environment helpers
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';

// Type exports for better TypeScript support
export type PageTitle = keyof typeof PAGE_TITLES;
export type AuthMode = typeof AUTH_MODES[keyof typeof AUTH_MODES];
export type NavTab = typeof NAV_TABS[keyof typeof NAV_TABS];
export type CustomEvent = typeof CUSTOM_EVENTS[keyof typeof CUSTOM_EVENTS];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];