import React, { useEffect, useState } from 'react';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useOfflineSync } from '../hooks/useOfflineSync';
import LocalStorageManager from '../db/localStorageManager';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-700 rounded-lg text-amber-200 text-sm ${className}`}
    >
      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      <span>Offline Mode - Local Library Only</span>
    </div>
  );
}

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  className = ''
}: ResponsiveContainerProps) {
  const device = useDeviceInfo();
  const layout = useResponsiveLayout();

  return (
    <div
      className={`responsive-container ${className}`}
      data-device={device.isMobile ? 'mobile' : device.isTablet ? 'tablet' : 'desktop'}
      data-orientation={device.orientation}
      data-touch={layout.touchFriendly}
      style={{
        '--grid-columns': layout.gridColumns.toString()
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export interface LibraryImportProps {
  onImport: (manager: LocalStorageManager) => void;
}

export function LibraryImportButton({ onImport }: LibraryImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const manager = new LocalStorageManager();

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        const text = await file.text();
        await manager.importLibrary(text);
        onImport(manager);
      };
      input.click();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleImport}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white transition-colors"
    >
      {isLoading ? 'Importing...' : 'Import Library'}
    </button>
  );
}

export interface LibraryExportProps {
  onExport?: () => void;
}

export function LibraryExportButton({ onExport }: LibraryExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const manager = new LocalStorageManager();

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const json = await manager.exportLibrary();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mylo-music-library-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition-colors"
    >
      {isLoading ? 'Exporting...' : 'Export Library'}
    </button>
  );
}
