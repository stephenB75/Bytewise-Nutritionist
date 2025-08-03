// Suppress browser extension errors in console
(function() {
  'use strict';
  
  // Override console.error to filter out extension errors
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Filter out known browser extension errors
    const extensionErrors = [
      'chrome-extension',
      'checkoutUrls',
      'content.js',
      'contentScript.bundle.js',
      'feature_extension-platform',
      'No resume URL',
      'Failed to execute \'put\' on \'Cache\': Request scheme \'chrome-extension\' is unsupported'
    ];
    
    const shouldSuppress = extensionErrors.some(error => 
      message.includes(error)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
  
  // Override window.onerror to suppress extension errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (source && (source.includes('chrome-extension') || source.includes('content.js'))) {
      return true; // Suppress the error
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Handle promise rejections from extensions
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    if (error && error.stack && error.stack.includes('chrome-extension')) {
      event.preventDefault();
    }
  });
})();