/**
 * Minimal Working App - No External Dependencies
 * Pure React with inline styles to bypass import issues
 */

import { useState } from 'react';

export default function MinimalApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '60px',
              height: '60px',
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
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 8px'
            }}>
              Bytewise
            </h1>
            <p style={{
              color: '#6b7280',
              margin: '0',
              fontSize: '14px'
            }}>
              Your nutrition tracking companion
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#1d4ed8'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#2563eb'}
            >
              Sign In
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            Working version - any credentials accepted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#2563eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              B
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0'
            }}>
              Bytewise
            </h1>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px'
            }}>
              Today's Calories
            </h3>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#3b82f6',
              margin: '0 0 8px'
            }}>
              1,847
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Goal: 2,000 cal
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px'
            }}>
              Protein
            </h3>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#10b981',
              margin: '0 0 8px'
            }}>
              127g
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Goal: 150g
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px'
            }}>
              Water Intake
            </h3>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#06b6d4',
              margin: '0 0 8px'
            }}>
              2.1L
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Goal: 2.5L
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 16px'
          }}>
            Recent Meals
          </h2>
          <div style={{ color: '#6b7280' }}>
            No meals logged today. Start tracking your nutrition!
          </div>
        </div>
      </div>
    </div>
  );
}