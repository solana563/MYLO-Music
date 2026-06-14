import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: 'large',
    orientation: 'landscape',
    screenWidth: 0,
    screenHeight: 0
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      let screenSize: 'small' | 'medium' | 'large' | 'xlarge';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;

      if (width < 480) {
        screenSize = 'small';
        isMobile = true;
      } else if (width < 768) {
        screenSize = 'medium';
        isMobile = true;
      } else if (width < 1024) {
        screenSize = 'large';
        isTablet = true;
      } else {
        screenSize = 'xlarge';
        isDesktop = true;
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
        screenWidth: width,
        screenHeight: height
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}
