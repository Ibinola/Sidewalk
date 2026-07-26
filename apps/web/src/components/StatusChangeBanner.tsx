import React, { useState } from 'react';
import type { BannerAlert } from '@qyou/shared';

interface StatusChangeBannerProps {
  alert: BannerAlert;
}

export function StatusChangeBanner({ alert }: StatusChangeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{alert.content}</span>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {alert.actionUrl && (
          <a href={alert.actionUrl} style={{ color: '#fff', textDecoration: 'underline', fontSize: '14px' }}>
            View Details
          </a>
        )}
        {alert.isDismissible && (
          <button onClick={() => setIsVisible(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}
