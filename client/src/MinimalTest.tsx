export default function MinimalTest() {
  return (
    <div style={{ 
      backgroundColor: '#fef7cd', 
      color: '#1d1d1b',
      minHeight: '100vh',
      padding: '20px',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>REACT IS WORKING</h1>
      <p>If you can see this text, React is rendering correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Location: {window.location.href}</p>
    </div>
  );
}