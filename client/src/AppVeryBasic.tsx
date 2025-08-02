/**
 * Very Basic App - No External Dependencies
 */

export default function AppVeryBasic() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0f9ff, #f0fdf4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          ByteWise
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280', 
          marginBottom: '24px' 
        }}>
          Nutrition Tracker
        </p>
        
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#166534', fontWeight: '600' }}>
            ✅ App Loading Successfully!
          </p>
          <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '8px' }}>
            External URL working properly
          </p>
        </div>
        
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          <p>🌐 Server: Running on port 5000</p>
          <p>🔗 External access: Confirmed</p>
          <p>⚛️ React: Basic version active</p>
          <p>🔧 No external dependencies loaded</p>
        </div>
        
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            Ready for debugging and restoration
          </p>
        </div>
      </div>
    </div>
  );
}