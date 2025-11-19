// src/components/UpdateNotification.tsx
import { JSX } from 'react';
import { useAppUpdate } from '../../sw';

export function UpdateNotification(): JSX.Element | null {
  const { updateAvailable, refreshApp } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#007acc',
      color: 'white',
      padding: '12px 16px',
      textAlign: 'center',
      zIndex: 10000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      fontSize: '14px'
    }}>
      <span>🎉 A new version is available!</span>
      <button 
        onClick={refreshApp}
        style={{
          background: 'white',
          color: '#007acc',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px'
        }}
      >
        Update Now
      </button>
    </div>
  );
}