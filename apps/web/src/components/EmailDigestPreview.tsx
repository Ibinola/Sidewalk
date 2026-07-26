import React from 'react';
import type { EmailDigestTemplate } from '@qyou/shared';

interface EmailDigestPreviewProps {
  template: EmailDigestTemplate;
}

export function EmailDigestPreview({ template }: EmailDigestPreviewProps) {
  return (
    <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f172a', margin: '0 0 16px 0', fontSize: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
        Your {template.frequency} Civic Update, {template.recipient.name}
      </h2>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {template.items.map((item) => (
          <li key={item.id} style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>
              {item.category}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
              {item.description}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        Sent to {template.recipient.email} • Generated at {new Date(template.generatedAtIso).toLocaleString()}
      </div>
    </div>
  );
}
