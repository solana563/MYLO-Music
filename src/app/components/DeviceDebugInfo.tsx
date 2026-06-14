import React from 'react';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useTouchDetection } from '../hooks/useTouchDetection';

export function DeviceDebugInfo() {
  const device = useDeviceInfo();
  const layout = useResponsiveLayout();
  const touch = useTouchDetection();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(0,0,0,0.8)',
        color: '#0f0',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        borderRadius: '4px',
        zIndex: 9999,
        maxWidth: '300px'
      }}
    >
      <div><strong>Device:</strong> {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}</div>
      <div><strong>Screen:</strong> {device.screenSize} ({device.screenWidth}x{device.screenHeight})</div>
      <div><strong>Orientation:</strong> {device.orientation}</div>
      <div><strong>Touch:</strong> {touch.isTouchDevice ? 'Yes' : 'No'}</div>
      <div><strong>Hover:</strong> {touch.supportsHover ? 'Yes' : 'No'}</div>
      <div><strong>Layout Cols:</strong> {layout.gridColumns}</div>
      <div><strong>Compact:</strong> {layout.compactMode ? 'Yes' : 'No'}</div>
    </div>
  );
}
