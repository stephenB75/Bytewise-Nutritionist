import React from 'react';

export default function TestApp() {
  return (
    <div style={{ 
      backgroundColor: '#fef7cd', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1d1d1b', fontSize: '24px', marginBottom: '20px' }}>
        ByteWise Test - React Loading Successfully
      </h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p>✅ React is working</p>
        <p>✅ CSS styling is working</p>
        <p>✅ TypeScript compilation is working</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}