import React from "react";

export default function SimpleTest() {
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
      <h1 style={{ color: '#faed39', marginBottom: '20px' }}>
        ByteWise Nutritionist
      </h1>
      <p>Simple React Component Test</p>
      <div style={{
        padding: '20px',
        background: 'green',
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        ✅ React Hooks Errors Fixed!
      </div>
    </div>
  );
}