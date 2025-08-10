import { useEffect, useState } from 'react';
import { config } from '@/lib/config';
import { Loader2, ExternalLink } from 'lucide-react';

export default function DomainRedirect() {
  const [countdown, setCountdown] = useState(2);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  useEffect(() => {
    // Check if we're on Replit preview URL - updated pattern matching
    const hostname = window.location.hostname;
    const href = window.location.href;
    
    // More comprehensive Replit URL detection
    const isReplit = hostname.includes('replit.dev') || 
                     hostname.includes('replit.app') || 
                     hostname.includes('repl.co') ||
                     hostname.includes('janeway.replit.dev') ||
                     href.includes('replit.dev') ||
                     // Check for the specific pattern in your screenshot
                     !!hostname.match(/^[a-f0-9-]+\.[a-z0-9-]+\.replit\.dev$/);
    
    console.log('DomainRedirect Check:');
    console.log('- Current URL:', href);
    console.log('- Hostname:', hostname);
    console.log('- Is Replit Preview:', isReplit);
    console.log('- Target:', 'https://bytewisenutritionist.com');
    
    setShouldRedirect(isReplit);
    
    if (!isReplit) return;
    
    // Immediate redirect with short countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Force redirect to custom domain
          console.log('Redirecting now to: https://bytewisenutritionist.com');
          window.location.replace('https://bytewisenutritionist.com');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!shouldRedirect) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl border border-yellow-400/30 p-8 text-center space-y-6">
        {/* ByteWise Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl font-black text-gray-900">BW</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">
            Redirecting to ByteWise Nutritionist
          </h1>
          <p className="text-gray-400">
            You're being redirected to our primary domain for the best experience
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <ExternalLink className="w-5 h-5" />
            <span className="font-semibold text-lg">bytewisenutritionist.com</span>
          </div>
          <div className="text-gray-500 text-sm">
            Redirecting in {countdown} seconds...
          </div>
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        </div>
        
        <div className="pt-4 border-t border-gray-800">
          <a 
            href="https://bytewisenutritionist.com"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
          >
            Click here if you're not redirected automatically
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}