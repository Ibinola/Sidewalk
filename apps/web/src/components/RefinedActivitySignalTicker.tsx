import React from 'react';
import type { ActivityFeedState } from '@qyou/shared';

interface RefinedActivitySignalTickerProps {
  state: ActivityFeedState;
}

export function RefinedActivitySignalTicker({ state }: RefinedActivitySignalTickerProps) {
  if (!state.events || state.events.length === 0) return null;

  return (
    <div style={{ background: '#0f172a', padding: '10px 20px', display: 'flex', overflowX: 'hidden', whiteSpace: 'nowrap', alignItems: 'center' }}>
      <div style={{ marginRight: '16px', fontWeight: 'bold', fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {state.isLive && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />}
        Live
      </div>
      <div style={{ display: 'flex', gap: '32px', animation: 'marquee 30s linear infinite' }}>
        {state.events.map((evt) => (
          <div key={evt.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ color: evt.theme === 'highlight' ? '#fcd34d' : evt.theme === 'urgent' ? '#f87171' : '#f8fafc', fontWeight: '600' }}>
              {evt.title}
            </span>
            <span style={{ color: '#94a3b8' }}>- {evt.summary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
