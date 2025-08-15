import { useState } from 'react';

export function TestComponent() {
  const [test, setTest] = useState('Hello World');
  
  return (
    <div style={{ padding: '20px', background: 'green', color: 'white' }}>
      <h1>Test Component: {test}</h1>
      <button onClick={() => setTest('Hooks Working!')}>
        Test Hook
      </button>
    </div>
  );
}