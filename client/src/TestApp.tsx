/**
 * Simple test component to verify preview functionality
 */

import React from 'react';

export default function TestApp() {
  return (
    <div style={{
      background: '#0a0a00',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <div style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: '#faed39',
          marginBottom: '1rem',
          textTransform: 'lowercase'
        }}>
          bytewise
        </div>
        <div style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '2rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          nutritionist
        </div>
        <div style={{
          fontSize: '1.5rem',
          color: '#45c73e',
          marginBottom: '1rem'
        }}>
          ✅ Preview Working!
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)'
        }}>
          React app is loading successfully
        </div>
      </div>
    </div>
  );
}