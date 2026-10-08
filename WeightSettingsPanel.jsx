import React, { useState } from 'react';
import { Sliders, RefreshCw, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

// Default weights as integers (must sum to 100)
const DEFAULT_PCT = { mandatory: 50, preferred: 25, experience: 15, education: 10 };

// Sample candidate performance scores used for the live preview (per dimension, 0–100)
const SAMPLE = { mandatory: 80, preferred: 60, experience: 90, education: 100 };

const WEIGHT_DEFS = [
  {
    key: 'mandatory',
    label: 'Mandatory Skill Match',
    color: 'var(--brand-indigo)',
    gradient: 'var(--gradient-brand)',
    description: 'Skills listed as "required" or "must have" in the JD.',
  },
  {
    key: 'preferred',
    label: 'Preferred Skill Match',
    color: 'var(--accent-teal)',
    gradient: 'var(--gradient-teal)',
    description: 'Skills listed as "nice to have" or "preferred".',
  },
  {
    key: 'experience',
    label: 'Experience Years',
    color: 'var(--warning-amber)',
    gradient: 'var(--gradient-amber)',
    description: "Candidate's detected years of professional experience vs JD minimum.",
  },
  {
    key: 'education',
    label: 'Education Level',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    description: 'Highest degree detected vs minimum education requirement.',
  },
];

export default function WeightSettingsPanel() {
  const { weights, updateWeights, loading } = useScreening();

  // Internal state stored as integers 0–100 for precise 1% increments
  const [pct, setPct] = useState({
    mandatory:  Math.round((weights.mandatory  != null ? weights.mandatory  : DEFAULT_PCT.mandatory  / 100) * 100),
    preferred:  Math.round((weights.preferred  != null ? weights.preferred  : DEFAULT_PCT.preferred  / 100) * 100),
    experience: Math.round((weights.experience != null ? weights.experience : DEFAULT_PCT.experience / 100) * 100),
    education:  Math.round((weights.education  != null ? weights.education  : DEFAULT_PCT.education  / 100) * 100),
  });

  const total   = pct.mandatory + pct.preferred + pct.experience + pct.education;
  const isValid = total === 100;
  const diff    = total - 100;

  const totalLabel = isValid
    ? '100%'
    : total < 100
      ? `${total}%  (need +${100 - total}% more)`
      : `${total}%  (−${diff}% over limit)`;

  // Independent slider — dragging one never changes others
  const handleSlider = (key, rawValue) => {
    setPct((prev) => ({ ...prev, [key]: parseInt(rawValue, 10) }));
  };

  const handleReset = () => setPct({ ...DEFAULT_PCT });

  const handleSave = () => {
    if (!isValid) return;
    updateWeights({
      mandatory:  pct.mandatory  / 100,
      preferred:  pct.preferred  / 100,
      experience: pct.experience / 100,
      education:  pct.education  / 100,
    });
  };

  // Live score: weighted sum of sample dimension scores, capped at 100
  const sampleScore = Math.min(100, Math.round(
    (pct.mandatory  * SAMPLE.mandatory  +
     pct.preferred  * SAMPLE.preferred  +
     pct.experience * SAMPLE.experience +
     pct.education  * SAMPLE.education) / 100
  ));

  return (
    <div className="app-container">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sliders style={{ width: 22, height: 22, color: 'var(--brand-indigo)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Scoring Weight Settings</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              Customize the composite scoring formula — weights must sum to 100%
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Sliders panel ── */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {WEIGHT_DEFS.map(({ key, label, color, gradient, description }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color,
                    minWidth: 56, textAlign: 'right',
                  }}>
                    {pct[key]}%
                  </span>
                </div>

                {/* Track + live fill + range input */}
                <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
                  {/* Grey track */}
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '100%', height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99,
                  }} />
                  {/* Coloured fill — mirrors slider position instantly */}
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: `${pct[key]}%`, height: 6,
                    background: gradient, borderRadius: 99,
                    pointerEvents: 'none',
                    transition: 'width 0.04s linear',
                  }} />
                  {/* Continuous slider: 0 → 100, step 1 */}
                  <input
                    type="range"
                    id={`slider-${key}`}
                    min="0"
                    max="100"
                    step="1"
                    value={pct[key]}
                    onChange={(e) => handleSlider(key, e.target.value)}
                    className="slider-glass"
                    style={{ position: 'relative', zIndex: 1 }}
                  />
                </div>
              </div>
            ))}

            {/* ── Total weight indicator ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              background: isValid ? 'rgba(20,184,166,0.08)' : 'rgba(245,158,11,0.10)',
              border: `1px solid ${isValid ? 'rgba(20,184,166,0.25)' : 'rgba(245,158,11,0.30)'}`,
              borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total weight sum:</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem',
                color: isValid ? 'var(--accent-teal)' : 'var(--warning-amber)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                {isValid
                  ? <><CheckCircle2 style={{ width: 14, height: 14 }} /> 100%</>
                  : <><AlertTriangle style={{ width: 14, height: 14 }} /> {totalLabel}</>
                }
              </span>
            </div>

            {/* ── Action row ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={handleReset} className="btn-ghost" style={{ fontSize: '0.82rem' }}>
                <RotateCcw style={{ width: 14, height: 14 }} />
                Reset Defaults (50/25/15/10)
              </button>
              <button
                id="save-weights-btn"
                onClick={handleSave}
                disabled={loading || !isValid}
                className="btn-primary"
                style={{ padding: '0.7rem 1.75rem' }}
              >
                <RefreshCw style={{ width: 15, height: 15 }} />
                Save &amp; Re-screen
              </button>
            </div>
          </div>

          {/* ── Live Preview panel ── */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: 80 }}>
            <div>
              <p className="text-label" style={{ marginBottom: '0.35rem' }}>Live Score Preview</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Sample candidate: 80% mandatory, 60% preferred, 90% exp, 100% edu
              </p>
            </div>

            {/* Score ring */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 120, height: 120, borderRadius: '50%',
                background: isValid
                  ? `conic-gradient(var(--brand-indigo) 0% ${sampleScore}%, rgba(255,255,255,0.06) ${sampleScore}% 100%)`
                  : 'rgba(255,255,255,0.05)',
                position: 'relative',
                transition: 'background 0.1s ease',
              }}>
                <div style={{
                  position: 'absolute', inset: 10, borderRadius: '50%',
                  background: 'var(--bg-layer-1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--brand-indigo)', lineHeight: 1 }}>
                    {isValid ? sampleScore : '—'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>/ 100</span>
                </div>
              </div>
              {!isValid && (
                <p style={{ fontSize: '0.7rem', color: 'var(--warning-amber)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                  Set total to 100% to enable preview
                </p>
              )}
            </div>

            {/* Breakdown bars — fully dynamic from current pct values */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {WEIGHT_DEFS.map(({ key, label, color, gradient }) => {
                const pts = Math.round(pct[key] * SAMPLE[key] / 100);
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ color, fontWeight: 700 }}>+{pts}pts</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 5 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pts}%`,
                          background: gradient,
                          transition: 'width 0.1s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
