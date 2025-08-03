import React, { useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8 text-white">
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        Increment
      </button>
    </div>
  );
}