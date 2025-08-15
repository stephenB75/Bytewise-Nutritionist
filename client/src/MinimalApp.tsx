export default function MinimalApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '24px'
    }}>
      <h1 style={{ color: '#faed39', marginBottom: '20px' }}>ByteWise Nutritionist</h1>
      <p>Basic React is working!</p>
      <div style={{ 
        padding: '20px', 
        background: 'green', 
        borderRadius: '10px', 
        marginTop: '20px' 
      }}>
        ✅ React Rendering Successfully
      </div>
    </div>
  );
}