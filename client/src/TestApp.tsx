/**
 * Ultra-minimal test app to isolate white screen issue
 */

import { useState } from 'react';

export default function TestApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
          🎯 Bytewise Test App
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
          If you can see this page, React is working correctly. The white screen issue 
          is likely caused by component errors or authentication wrapper problems.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Interactive Test</h2>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Count: {count}
          </button>
          
          <button 
            onClick={() => setCount(0)}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ 
          background: '#f9fafb', 
          padding: '20px', 
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '15px' }}>Debug Information</h3>
          <ul style={{ color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
            <li>React rendering: ✅ Working</li>
            <li>State management: ✅ Working (count: {count})</li>
            <li>Styling: ✅ Working</li>
            <li>Event handlers: ✅ Working</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            This confirms the basic React app infrastructure is functional.
            <br />
            The main app white screen is caused by component-level issues.
          </p>
        </div>
      </div>
    </div>
  );
}