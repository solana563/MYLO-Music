import { useEffect } from 'react';
import { useDeviceInfo } from './useDeviceInfo';
import { useTouchDetection } from './useTouchDetection';

export interface ResponsiveLayout {
  showSidebar: boolean;
  sidebarPosition: 'left' | 'bottom' | 'overlay';
  playerBarPosition: 'bottom' | 'floating';
  gridColumns: number;
  compactMode: boolean;
  touchFriendly: boolean;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const device = useDeviceInfo();
  const touch = useTouchDetection();

  // Determine responsive layout based on device
  let layout: ResponsiveLayout = {
    showSidebar: true,
    sidebarPosition: 'left',
    playerBarPosition: 'bottom',
    gridColumns: 4,
    compactMode: false,
    touchFriendly: touch.isTouchDevice
  };

  if (device.isMobile) {
    // Mobile: stack everything vertically
    layout = {
      showSidebar: false,
      sidebarPosition: 'bottom',
      playerBarPosition: 'floating',
      gridColumns: 1,
      compactMode: true,
      touchFriendly: true
    };

    // Landscape mobile: show minimal sidebar
    if (device.orientation === 'landscape') {
      layout.gridColumns = 2;
      layout.sidebarPosition: 'overlay';
    }
  } else if (device.isTablet) {
    // Tablet: balanced layout
    layout = {
      showSidebar: true,
      sidebarPosition: 'left',
      playerBarPosition: 'bottom',
      gridColumns: 3,
      compactMode: false,
      touchFriendly: true
    };

    // Landscape tablet
    if (device.orientation === 'landscape') {
      layout.gridColumns = 4;
    }
  } else if (device.isDesktop) {
    // Desktop: full layout
    layout = {
      showSidebar: true,
      sidebarPosition: 'left',
      playerBarPosition: 'bottom',
      gridColumns: 5,
      compactMode: false,
      touchFriendly: false
    };

    // Extra large desktop
    if (device.screenSize === 'xlarge') {
      layout.gridColumns = 6;
    }
  }

  useEffect(() => {
    // Apply touch-friendly styles if needed
    if (layout.touchFriendly) {
      document.documentElement.style.setProperty('--touch-target-size', '48px');
    } else {
      document.documentElement.style.setProperty('--touch-target-size', '32px');
    }
  }, [layout.touchFriendly]);

  return layout;
}
