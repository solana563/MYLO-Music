import { useEffect, useState } from 'react';

interface TouchInfo {
  isTouchDevice: boolean;
  isPointerDevice: boolean;
  supportsHover: boolean;
}

export function useTouchDetection(): TouchInfo {
  const [touchInfo, setTouchInfo] = useState<TouchInfo>({
    isTouchDevice: false,
    isPointerDevice: false,
    supportsHover: true
  });

  useEffect(() => {
    const isTouchDevice = () => {
      return (
        (window as any).ontouchstart !== undefined ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    const isPointerDevice = () => {
      return window.matchMedia('(pointer:fine)').matches;
    };

    const supportsHover = () => {
      return window.matchMedia('(hover:hover)').matches;
    };

    setTouchInfo({
      isTouchDevice: isTouchDevice(),
      isPointerDevice: isPointerDevice(),
      supportsHover: supportsHover()
    });
  }, []);

  return touchInfo;
}
