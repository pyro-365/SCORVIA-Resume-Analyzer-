import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';

const STEPS = [
  { title: 'Text Tokenization & Stop-word Filtering', desc: 'Cleaning raw text, stripping punctuation, breaking into tokens.' },
  { title: 'Section Segmentation', desc: 'Detecting headings: Skills, Experience, Education, Projects.' },
  { title: 'Skill Phrase Matching', desc: 'Scanning for multi-word canonical skill variants via O(1) dictionary.' },
  { title: 'Negation Context Detection', desc: 'Filtering out negated claims: "no experience in Java".' },
  { title: 'Experience & Education Extraction', desc: 'Extracting years of experience and highest degree level.' },
  { title: 'Weighted Scoring & Penalties', desc: 'Applying formula (0.50/0.25/0.15/0.10) + missing mandatory penalties.' },
  { title: 'Deterministic Candidate Ranking', desc: 'Applying tie-break rules and generating explainability report.' },
];

export default function ProcessingShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const progress = Math.round((activeStep / (STEPS.length - 1)) * 100);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((p) => (p < STEPS.length - 1 ? p + 1 : p));
    }, 480);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      minHeight: 'calc(100vh - 144px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
    }}>
      {/* Gradient backdrop — only on this screen */}
      <div className="processing-backdrop" />

      <div style={{ maxWidth: 640, width: '100%' }}>
        {/* Orb hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
            {/* Glow rings */}
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
            }} />
            <img
              src="/illustrations/processing_orb.png"
              alt="Processing — 3D indigo orb with orbiting documents"
              className="animate-float"
              style={{
                width: 160, height: 160, objectFit: 'contain',
                position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 16px 40px rgba(124,58,237,0.50))',
              }}
            />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Executing Analysis Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 440, margin: '0 auto' }}>
            Evaluating candidate resumes against job description rules — deterministic, offline, no external APIs.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="text-label">Analysis Progress</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-indigo)' }}>{progress}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: 6 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, background: 'var(--gradient-brand)' }}
            />
          </div>
        </div>

        {/* Step list */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {STEPS.map((step, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isDone
                    ? 'rgba(20,184,166,0.08)'
                    : isCurrent
                    ? 'rgba(79,70,229,0.12)'
                    : 'transparent',
                  border: `1px solid ${isDone ? 'rgba(20,184,166,0.20)' : isCurrent ? 'rgba(79,70,229,0.30)' : 'transparent'}`,
                  opacity: !isDone && !isCurrent ? 0.45 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Status icon */}
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {isDone ? (
                    <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--accent-teal)' }} />
                  ) : isCurrent ? (
                    <Loader2 style={{ width: 15, height: 15, color: 'var(--brand-indigo)', animation: 'spinSlow 0.8s linear infinite' }} />
                  ) : (
                    <div style={{ width: 15, height: 15, borderRadius: '50%', border: '1px solid var(--border)' }} />
                  )}
                </div>

                <div>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.15rem',
                    color: isDone ? 'var(--accent-teal)' : isCurrent ? '#c7d2fe' : 'var(--text-secondary)',
                  }}>
                    Step {idx + 1} — {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Zap style={{ width: 14, height: 14, color: 'var(--warning-amber)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Fully deterministic · Zero external API calls · All data stays local
          </span>
        </div>
      </div>
    </div>
  );
}
