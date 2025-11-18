/**
 * Performance Utilities
 * Helper functions to optimize app performance
 */

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function to limit function calls to at most once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoization utility for caching function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Simple cache for localStorage operations
 */
class StorageCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 30000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const storageCache = new StorageCache();

/**
 * Cached localStorage getter with TTL
 */
export function getCachedLocalStorage(key: string, ttl: number = 30000): any | null {
  const cacheKey = `localStorage:${key}`;
  
  // Check cache first
  if (storageCache.has(cacheKey)) {
    return storageCache.get(cacheKey);
  }
  
  // Get from localStorage and cache it
  try {
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : null;
    storageCache.set(cacheKey, parsed, ttl);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  
  static start(label: string) {
    this.timers.set(label, performance.now());
  }
  
  static end(label: string, logThreshold: number = 10) {
    const startTime = this.timers.get(label);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    if (duration > logThreshold) {
      console.warn(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    }
  }
  
  static measure<T>(label: string, fn: () => T, logThreshold: number = 10): T {
    this.start(label);
    const result = fn();
    this.end(label, logThreshold);
    return result;
  }
}