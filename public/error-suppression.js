/**
 * Enhanced Error Suppression for Browser Extension Conflicts
 * Bytewise Nutritionist - Production Error Handling
 */

(function() {
  'use strict';
  
  // Store original console methods to avoid suppressing our own logs
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Enhanced extension detection patterns
  const extensionPatterns = [
    /extension/i,
    /chrome-extension/i,
    /moz-extension/i,
    /content\.js/i,
    /checkoutUrls/i,
    /paymentUrls/i,
    /Cannot read properties of undefined.*reading.*checkoutUrls/i,
    /Cannot read properties of undefined.*reading.*paymentUrls/i,
    /honey/i,
    /capital one/i,
    /rakuten/i,
    /coupon/i,
    /deal/i,
    /shopping/i
  ];
  
  // Function to check if error is from extension
  function isExtensionError(error, filename, stack) {
    // Check filename
    if (filename) {
      if (extensionPatterns.some(pattern => pattern.test(filename))) {
        return true;
      }
    }
    
    // Check error message
    if (error && typeof error === 'string') {
      if (extensionPatterns.some(pattern => pattern.test(error))) {
        return true;
      }
    }
    
    // Check stack trace
    if (stack && typeof stack === 'string') {
      if (extensionPatterns.some(pattern => pattern.test(stack))) {
        return true;
      }
    }
    
    return false;
  }
  
  // Override console.error to suppress extension errors
  console.error = function(...args) {
    const errorMessage = args.join(' ');
    if (!isExtensionError(errorMessage)) {
      originalError.apply(console, args);
    }
  };
  
  // Override console.warn to suppress extension warnings
  console.warn = function(...args) {
    const warnMessage = args.join(' ');
    if (!isExtensionError(warnMessage)) {
      originalWarn.apply(console, args);
    }
  };
  
  // Global error suppression
  window.addEventListener('error', function(event) {
    if (isExtensionError(event.message, event.filename, event.error?.stack)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase
  
  // Promise rejection suppression
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    const errorMessage = error?.message || error?.toString() || '';
    const stack = error?.stack || '';
    
    if (isExtensionError(errorMessage, '', stack)) {
      event.preventDefault();
      return false;
    }
  });
  
  // CSP violation suppression for extensions
  document.addEventListener('securitypolicyviolation', function(event) {
    if (event.violatedDirective && 
        (event.sourceFile?.includes('extension') || 
         event.sourceFile?.includes('content') ||
         !event.sourceFile)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  
})();