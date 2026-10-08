import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="Scorivia" style={{ width: 18, height: 18, borderRadius: '4px', objectFit: 'cover' }} />
          <span className="footer-text">
            Scorivia &nbsp;·&nbsp; Rule-Based Resume Screening Engine
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck style={{ width: 13, height: 13, color: 'var(--accent-teal)' }} />
          <span className="footer-text">
            100% offline &nbsp;·&nbsp; No external APIs &nbsp;·&nbsp; All data stays local
          </span>
        </div>
      </div>
    </footer>
  );
}
