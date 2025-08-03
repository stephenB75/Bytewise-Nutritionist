import React from 'react';

export default function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <div className="text-6xl mb-4">🍎</div>
        <h1 className="text-4xl font-bold mb-2">ByteWise</h1>
        <p className="text-xl mb-4">Nutrition Tracker</p>
        <div className="bg-white/20 rounded-lg p-4 mb-4">
          <p className="text-sm">Standard Navigation Structure:</p>
          <div className="flex gap-2 mt-2 justify-center">
            <span className="bg-white/30 px-2 py-1 rounded text-xs">Home</span>
            <span className="bg-white/30 px-2 py-1 rounded text-xs">Nutrition</span>
            <span className="bg-white/30 px-2 py-1 rounded text-xs">Daily</span>
            <span className="bg-white/30 px-2 py-1 rounded text-xs">Profile</span>
          </div>
        </div>
        <p className="text-sm opacity-80">App is working correctly!</p>
      </div>
    </div>
  );
}