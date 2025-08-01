/**
 * Simplified App Component
 * Minimal working version to test rendering
 */

import { useState } from 'react';

export default function SimpleApp() {
  const [currentView, setCurrentView] = useState('login');

  if (currentView === 'login') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              B
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#111827',
              margin: '0 0 8px'
            }}>
              Bytewise
            </h1>
            <p style={{ 
              color: '#6b7280',
              margin: '0'
            }}>
              Sign in to your nutrition tracker
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input 
              type="email"
              placeholder="Email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            />
            <input 
              type="password"
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={() => setCurrentView('app')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            Sign In
          </button>

          <div style={{ 
            textAlign: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Simple app version - any credentials work
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{ color: '#1f2937', margin: '0' }}>Bytewise Dashboard</h1>
            <button
              onClick={() => setCurrentView('login')}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
          
          <p style={{ color: '#6b7280', margin: '0' }}>
            Welcome to your nutrition tracker! This simplified version confirms the app can render properly.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#374151', marginTop: '0' }}>Calories Today</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>1,847</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#374151', marginTop: '0' }}>Protein</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>127g</p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#374151', marginTop: '0' }}>Water</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4', margin: '0' }}>2.1L</p>
          </div>
        </div>
      </div>
    </div>
  );
}