import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Zap, Award, Cpu,
  FileText, Upload, BarChart3, BookOpen
} from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: '/illustrations/step_jd.png',
    label: 'Input & Review JD',
    desc: 'Paste or upload a job description text to extract requirements.',
    color: 'var(--brand-indigo)',
    path: '/jd-input',
  },
  {
    num: '02',
    icon: '/illustrations/step_dictionary.png',
    label: 'Configure Skills',
    desc: 'Curate the skill dictionary with canonical names & synonyms.',
    color: 'var(--accent-teal)',
    path: '/skill-dictionary',
  },
  {
    num: '03',
    icon: '/illustrations/step_score.png',
    label: 'Upload & Screen',
    desc: 'Batch upload candidate resumes — engine scores each in milliseconds.',
    color: 'var(--warning-amber)',
    path: '/resume-upload',
  },
  {
    num: '04',
    icon: '/illustrations/step_ranking.png',
    label: 'Rank & Evaluate',
    desc: 'Ranked dashboard with explainable breakdown and F1 accuracy metrics.',
    color: '#a78bfa',
    path: '/results',
  },
];

const FEATURES = [
  {
    icon: Cpu,
    color: 'var(--brand-indigo)',
    bg: 'rgba(79,70,229,0.14)',
    title: 'Pure Rule-Based Matcher',
    desc: 'Weighted composite scoring: 50% Mandatory, 25% Preferred, 15% Experience, 10% Education.',
  },
  {
    icon: Zap,
    color: 'var(--accent-teal)',
    bg: 'rgba(20,184,166,0.14)',
    title: 'Negation Context Filter',
    desc: 'Sliding-window negation detector catches false positives like "no experience in Java".',
  },
  {
    icon: Award,
    color: 'var(--warning-amber)',
    bg: 'rgba(245,158,11,0.14)',
    title: 'Explainability & Audit',
    desc: 'Human-readable bullet justifications per score, plus Precision, Recall, and F1 metrics.',
  },
];

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingTop: '1rem' }}>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 1180,
        margin: '0 auto',
        width: '100%',
        padding: '4rem 1.5rem 2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'center',
      }}
        className="hero-grid"
      >
        {/* Left: Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-slide-up">


          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15 }}>
            Smarter Screening,{' '}
            <br />
            <span className="gradient-text">Clearer Decisions.</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 480 }}>
            Screen resumes against job descriptions with transparent, deterministic matching.
            Customize skills, detect multi-word phrases and negations, and understand exactly
            why every candidate scores the way they do — completely offline.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <NavLink to="/jd-input" className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.8rem 1.8rem' }}>
              Start Screening
              <ArrowRight style={{ width: 18, height: 18 }} />
            </NavLink>
            <NavLink to="/skill-dictionary" className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.8rem 1.5rem' }}>
              <BookOpen style={{ width: 16, height: 16 }} />
              Manage Skills
            </NavLink>
          </div>

          {/* Mini stats strip */}
          <div style={{ display: 'flex', gap: '2rem', paddingTop: '0.5rem' }}>
            {[
              { val: '< 50ms', label: 'per resume' },
              { val: '100%', label: 'offline' },
              { val: '∞', label: 'candidates' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }} className="gradient-text">
                  {val}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Animated Brand Logo Showcase */}
        <div className="hero-logo-wrapper">
          {/* Rotating gradient aura */}
          <div className="hero-logo-aura" />



          <div className="hero-logo-card">
            <img
              src="/hero-logo.png"
              alt="Scorivia Brand Logo"
              className="hero-logo-img"
              style={{ objectFit: 'contain', padding: '1rem', background: 'transparent', mixBlendMode: 'normal' }}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="text-label" style={{ marginBottom: '0.5rem' }}>Powered by</p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>What makes it different</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1.25rem' }}>
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: bg,
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 22, height: 22, color }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 1.5rem 4rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="text-label" style={{ marginBottom: '0.5rem' }}>4-step workflow</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>End-to-End Screening Journey</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              From job description to ranked candidate list in under a minute.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
            gap: '1.5rem',
          }}>
            {STEPS.map(({ num, icon, label, desc, color, path }) => (
              <NavLink
                key={num}
                to={path}
                className="glass-card-interactive"
                style={{ padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', textAlign: 'center', textDecoration: 'none' }}
              >
                {/* Step number */}
                <div style={{
                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color, padding: '0.2rem 0.55rem',
                  background: `${color}18`, border: `1px solid ${color}30`,
                  borderRadius: 'var(--radius-full)',
                }}>
                  STEP {num}
                </div>

                {/* 3D icon */}
                <img
                  src={icon}
                  alt={label}
                  style={{
                    width: 80, height: 80, objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.40))',
                    transition: 'transform 0.3s ease',
                  }}
                />

                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {label}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
