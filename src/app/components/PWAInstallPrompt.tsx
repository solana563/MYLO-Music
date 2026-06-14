import React, { useEffect, useState } from 'react';

export interface PWAInstallPromptProps {
  onInstall?: () => void;
}

export function PWAInstallPrompt({ onInstall }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('MYLO Music installed');
          onInstall?.();
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between">
      <span>Install MYLO Music for offline access</span>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-white text-blue-600 rounded font-semibold hover:bg-gray-100"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 text-white hover:bg-blue-700 rounded"
        >
          Later
        </button>
      </div>
    </div>
  );
}
