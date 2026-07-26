import React from 'react';
import type { AlertPreviewPayload } from '@qyou/shared';

interface AlertPreviewExplainerProps {
  payload: AlertPreviewPayload;
}

export function AlertPreviewExplainer({ payload }: AlertPreviewExplainerProps) {
  return (
    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '16px' }}>{payload.headline}</h4>
      <p style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
        {payload.previewBody}
      </p>
      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
          ℹ️ {payload.explanationCopy}
        </p>
      </div>
    </div>
  );
}
