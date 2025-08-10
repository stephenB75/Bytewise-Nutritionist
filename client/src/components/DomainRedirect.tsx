import { useEffect, useState } from 'react';
import { config } from '@/lib/config';
import { Loader2, ExternalLink } from 'lucide-react';

export default function DomainRedirect() {
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    // Only redirect if on Replit preview
    if (!config.isReplitPreview) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to primary domain
          window.location.href = config.primaryUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (!config.isReplitPreview) return null;
  
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
            <span className="font-semibold text-lg">{config.primaryDomain}</span>
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
            href={config.primaryUrl}
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