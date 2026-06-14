import { useDeviceInfo } from './hooks/useDeviceInfo';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useTouchDetection } from './hooks/useTouchDetection';
import { OfflineIndicator, ResponsiveContainer } from './components/OfflineComponents';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { DeviceDebugInfo } from './components/DeviceDebugInfo';

export {
  // Hooks
  useDeviceInfo,
  useResponsiveLayout,
  useOfflineSync,
  useTouchDetection,
  // Components
  OfflineIndicator,
  ResponsiveContainer,
  PWAInstallPrompt,
  DeviceDebugInfo
};
