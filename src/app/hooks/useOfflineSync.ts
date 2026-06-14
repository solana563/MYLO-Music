import { useEffect } from 'react';

export function useOfflineSync() {
  useEffect(() => {
    // Handle offline state
    const handleOffline = () => {
      console.log('App is now offline');
      document.documentElement.setAttribute('data-offline', 'true');
    };

    const handleOnline = () => {
      console.log('App is now online');
      document.documentElement.setAttribute('data-offline', 'false');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Set initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}
