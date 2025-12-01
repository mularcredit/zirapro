// src/hooks/useAppUpdate.ts
import { useEffect, useState, useCallback } from 'react';

// CHANGE THIS ON EVERY DEPLOYMENT
// In useAppUpdate.ts
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export function useAppUpdate(): { 
  updateAvailable: boolean; 
  refreshApp: () => void;
} {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const VERSION_KEY = 'app_version';

  // 1. Check version on initial load
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    console.log('Version check:', {
      stored: storedVersion,
      current: APP_VERSION,
      match: storedVersion === APP_VERSION
    });

    if (storedVersion !== APP_VERSION) {
      console.log('Version mismatch - update required');
      setUpdateAvailable(true);
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
  }, []);

  // 2. Service Worker update detection (your existing code)
  useEffect(() => {
    const handleControllerChange = () => {
      setUpdateAvailable(true);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // Check for updates every 2 minutes
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 2 * 60 * 1000);

      return () => {
        clearInterval(interval);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  const refreshApp = (): void => {
    console.log('Refreshing app...');
    // Clear cache for this app
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force reload without cache
    window.location.href = window.location.origin + window.location.pathname;
  };

  return { updateAvailable, refreshApp };
}