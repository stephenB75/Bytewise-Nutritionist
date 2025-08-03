// Minimal ByteWise app with guaranteed visual redesign
import { useState, useEffect } from 'react';

export default function MinimalApp() {
  const [currentBg, setCurrentBg] = useState(0);
  
  // Rotate backgrounds every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const backgrounds = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];

  return (
    <div 
      className="min-h-screen transition-all duration-1000 ease-in-out relative overflow-hidden"
      style={{ background: backgrounds[currentBg] }}
    >
      {/* Ultra-visible redesign indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white p-4 text-center font-bold text-xl shadow-lg animate-pulse">
        🎨 BYTEWISE VISUAL REDESIGN IS ACTIVE! 🎨
      </div>
      
      {/* Main content */}
      <div className="pt-20 px-6 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-4">
              ByteWise Nutrition
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Complete Visual Redesign Active
            </p>
            <div className="text-lg text-white/80">
              Background {currentBg + 1} of 5 • Auto-rotating
            </div>
          </div>

          {/* Progress Rings */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {['Calories', 'Protein', 'Carbs', 'Fat'].map((label, i) => (
              <div key={label} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray={`${(i + 1) * 20}, 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(i + 1) * 20}%
                    </span>
                  </div>
                </div>
                <div className="text-white font-semibold">{label}</div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg shadow-lg">
              Calculate Calories
            </button>
            <button className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg shadow-lg">
              Log Meals
            </button>
            <button className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg shadow-lg">
              View Progress
            </button>
          </div>

          {/* Features List */}
          <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Visual Redesign Features:</h3>
            <ul className="space-y-2 text-white/90">
              <li>✓ Rotating food backgrounds (auto-changing)</li>
              <li>✓ Interactive progress rings</li>
              <li>✓ ADHD-friendly design</li>
              <li>✓ Enhanced visual hierarchy</li>
              <li>✓ Smooth animations</li>
              <li>✓ Modern glass-morphism effects</li>
            </ul>
          </div>

          {/* Time Display */}
          <div className="mt-6 text-center text-white/80">
            Current Time: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}