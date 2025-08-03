import React from 'react';

export function TestComponent() {
  return (
    <div style={{ padding: '40px', background: 'linear-gradient(135deg, #ff6b35, #f7931e)', color: 'white', minHeight: '100vh' }}>
      <h1>ByteWise Test Component</h1>
      <p>React is loading successfully without hooks</p>
      <div style={{ marginTop: '20px' }}>
        <p>✓ React import working</p>
        <p>✓ JSX rendering working</p>
        <p>✓ Basic component structure working</p>
      </div>
    </div>
  );
}