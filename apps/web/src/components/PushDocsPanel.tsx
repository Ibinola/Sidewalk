import React, { useState } from 'react';

export function PushDocsPanel() {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Mobile Push Device Management</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>
          Current Status: {isRegistered ? 'Device is registered for Push Alerts' : 'Device is NOT registered'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsRegistered(true)} disabled={isRegistered} style={{ padding: '8px 16px', background: isRegistered ? '#cbd5e1' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: isRegistered ? 'not-allowed' : 'pointer' }}>
            Register Device
          </button>
          <button onClick={() => setIsRegistered(false)} disabled={!isRegistered} style={{ padding: '8px 16px', background: !isRegistered ? '#cbd5e1' : '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: !isRegistered ? 'not-allowed' : 'pointer' }}>
            Revoke Push Access
          </button>
        </div>
      </div>
    </div>
  );
}
