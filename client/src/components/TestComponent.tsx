/**
 * Simple test component to verify React is working
 */

import { useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ByteWise Test</h1>
        <p className="text-lg mb-4">Count: {count}</p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Increment
        </button>
      </div>
    </div>
  );
}