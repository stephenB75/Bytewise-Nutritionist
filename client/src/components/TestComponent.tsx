import React, { useState } from 'react';

export function TestComponent() {
  const [test, setTest] = useState('working');
  
  return (
    <div>
      <h1>React Test: {test}</h1>
      <button onClick={() => setTest('clicked')}>Test useState</button>
    </div>
  );
}