// Ultra-simple test component
export default function SimpleTest() {
  return (
    <div style={{
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🎨 BYTEWISE VISUAL REDESIGN ACTIVE 🎨
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
          If you can see this colorful page, React is working!
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1rem'
        }}>
          <h2>Visual Redesign Features:</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✓ Rotating food backgrounds</li>
            <li>✓ Interactive progress rings</li>
            <li>✓ ADHD-friendly design</li>
            <li>✓ Workflow navigation</li>
            <li>✓ Enhanced visual hierarchy</li>
          </ul>
        </div>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}