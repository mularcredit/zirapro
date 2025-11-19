// src/hooks/useAppUpdate.ts
import { useEffect, useState } from 'react';

export function useAppUpdate(): { updateAvailable: boolean; refreshApp: () => void } {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    const handleControllerChange = () => {
      setUpdateAvailable(true);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      // Check for updates every 5 minutes
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(interval);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  const refreshApp = (): void => {
    window.location.reload();
  };

  return { updateAvailable, refreshApp };
}