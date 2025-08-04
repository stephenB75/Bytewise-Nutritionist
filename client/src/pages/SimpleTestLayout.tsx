/**
 * Simple Test Layout - Minimal component to test React useEffect error
 */

import React, { useState } from 'react';

export default function SimpleTestLayout() {
  const [message, setMessage] = useState('Hello ByteWise!');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ByteWise Nutrition</h1>
        <p className="text-xl">{message}</p>
        <button 
          onClick={() => setMessage('Testing React State!')}
          className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}