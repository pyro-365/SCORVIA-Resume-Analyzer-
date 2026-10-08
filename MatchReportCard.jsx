import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, FileText,
  Save, Info, Award, UserCheck, BookOpen, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

/* SVG Circular Score Ring */
function ScoreRing({ score = 0, size = 160 }) {
  const radius = (size - 16) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 70 ? '#14b8a6' :
    score >= 45 ? '#f59e0b' :
    '#ef4444';
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 900;
    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(score * ease));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="score-ring-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 8px ${color}88)`,
            transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>
      <div className="score-ring-label">
        <div className="score-ring-value" style={{ fontSize: size * 0.22, color }}>
          {displayed}
        </div>
        <div className="score-ring-unit">/ 100</div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color, weight }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 6 }}>({weight} weight)</span>
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>{value}%</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${value}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
}

export default function MatchReportCard() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { currentRunId, fetchCandidateReport, selectedCandidate, saveRecruiterNote, submitManualLabel, results, removeCandidateResult } = useScreening();

  const [activeTab, setActiveTab] = useState('breakdown');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (candidateId && currentRunId) {
      fetchCandidateReport(candidateId, currentRunId);
    }
  }, [candidateId, currentRunId]);

  useEffect(() => {
    if (selectedCandidate?.recruiterNote) {
      setNoteText(selectedCandidate.recruiterNote);
    }
  }, [selectedCandidate]);

  if (!selectedCandidate) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Loading candidate report…</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(79,70,229,0.3)', borderTopColor: 'var(--brand-indigo)', animation: 'spinSlow 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  const c = selectedCandidate;

  /* Prev/Next navigation */
  const currentIdx = results.findIndex((r) => String(r.resumeId) === String(candidateId));
  const prevCandidate = results[currentIdx - 1];
  const nextCandidate = results[currentIdx + 1];

  const recColor = c.recommendation === 'Suitable'
    ? 'var(--accent-teal)'
    : c.recommendation === 'Partially suitable'
    ? 'var(--warning-amber)'
    : 'var(--danger-coral)';

  const recBadgeClass = c.recommendation === 'Suitable'
    ? 'badge badge-suitable'
    : c.recommendation === 'Partially suitable'
    ? 'badge badge-partial'
    : 'badge badge-unsuitable';

  const TABS = [
    { id: 'breakdown', label: 'Score Breakdown', icon: Award },
    { id: 'rawText', label: 'Raw Resume', icon: FileText },
    { id: 'sections', label: 'Sections', icon: BookOpen },
  ];

  return (
    <div className="app-container">
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>

        {/* Top nav row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button onClick={() => navigate('/results')} className="btn-ghost">
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back to Rankings
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => {
                removeCandidateResult(candidateId);
                navigate('/results');
              }}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', color: 'var(--danger-coral)' }}
              title="Delete candidate from results"
            >
              <Trash2 style={{ width: 14, height: 14 }} /> Delete Candidate
            </button>
            {prevCandidate && (
              <button onClick={() => navigate(`/results/${prevCandidate.resumeId}`)} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                <ChevronLeft style={{ width: 14, height: 14 }} /> Prev
              </button>
            )}
            {nextCandidate && (
              <button onClick={() => navigate(`/results/${nextCandidate.resumeId}`)} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                Next <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Score panel */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
            {/* Ring */}
            <ScoreRing score={c.finalScore} size={160} />

            {/* File name & rank */}
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }} className="truncate">
                {c.fileName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 99, padding: '0.2rem 0.6rem', color: 'var(--text-secondary)' }}>
                  Rank #{c.rank}
                </span>
                <span className={recBadgeClass} style={{ fontSize: '0.68rem' }}>
                  {c.recommendation}
                </span>
              </div>
            </div>

            <hr className="divider" style={{ width: '100%' }} />

            {/* Score bars breakdown */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <ScoreBar label="Mandatory" value={c.scoresBreakdown?.mandatory || 0} color="var(--brand-indigo)" weight="50%" />
              <ScoreBar label="Preferred" value={c.scoresBreakdown?.preferred || 0} color="var(--accent-teal)" weight="25%" />
              <ScoreBar label="Experience" value={c.scoresBreakdown?.experience || 0} color="var(--warning-amber)" weight="15%" />
              <ScoreBar label="Education" value={c.scoresBreakdown?.education || 0} color="#a78bfa" weight="10%" />
            </div>

            <hr className="divider" style={{ width: '100%' }} />

            {/* Meta */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Experience: </span>
                <span style={{ fontWeight: 600 }}>{c.detectedExperienceYears || 0} yrs</span>
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Education: </span>
                <span style={{ fontWeight: 600 }}>{c.detectedEducation ? c.detectedEducation.toUpperCase() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right: Tabbed detail panel */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.8rem', fontFamily: 'var(--font-heading)', fontWeight: 600,
                    background: activeTab === id ? 'var(--gradient-brand)' : 'transparent',
                    color: activeTab === id ? '#fff' : 'var(--text-secondary)',
                    boxShadow: activeTab === id ? 'var(--glow-brand-sm)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Breakdown */}
            {activeTab === 'breakdown' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Matched / Missing skill chips */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.20)', borderRadius: 12 }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-teal)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CheckCircle2 style={{ width: 13, height: 13 }} /> Matched Skills
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', width: '100%', marginBottom: 4 }}>Mandatory</span>
                      {(c.matchedMandatory || []).map((s) => <span key={s} className="chip chip-mandatory" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>✓ {s}</span>)}
                      {!c.matchedMandatory?.length && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', width: '100%', marginBottom: 4 }}>Preferred</span>
                      {(c.matchedPreferred || []).map((s) => <span key={s} className="chip chip-preferred" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>✓ {s}</span>)}
                      {!c.matchedPreferred?.length && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 12 }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger-coral)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertTriangle style={{ width: 13, height: 13 }} /> Missing / Penalized
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', width: '100%', marginBottom: 4 }}>Mandatory</span>
                      {(c.missingMandatory || []).map((s) => <span key={s} className="chip chip-missing" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>✗ {s}</span>)}
                      {!c.missingMandatory?.length && <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontStyle: 'italic' }}>All matched! ✓</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', width: '100%', marginBottom: 4 }}>Preferred</span>
                      {(c.missingPreferred || []).map((s) => <span key={s} className="chip chip-general" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>– {s}</span>)}
                      {!c.missingPreferred?.length && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </div>
                </div>

                {/* Explainability bullets */}
                <div style={{ padding: '1.25rem', background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.20)', borderRadius: 12 }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Info style={{ width: 13, height: 13 }} /> Explainability Audit — Why this score?
                  </h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: 0, listStyle: 'none' }}>
                    {(c.explanationBullets || []).map((line, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--brand-indigo)', flexShrink: 0 }}>›</span>
                        <span>{line}</span>
                      </li>
                    ))}
                    {!c.explanationBullets?.length && (
                      <li style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No explanation bullets available.</li>
                    )}
                  </ul>
                </div>

                {/* Ground truth & notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <label className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <UserCheck style={{ width: 12, height: 12 }} /> Manual Ground Truth
                    </label>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      For Precision, Recall & F1 evaluation
                    </p>
                    <select
                      id="manual-label"
                      value={c.manualLabel || ''}
                      onChange={(e) => submitManualLabel(c.resumeId, e.target.value)}
                      className="select-glass"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <option value="">Select ground truth…</option>
                      <option value="suitable">Suitable</option>
                      <option value="partially suitable">Partially Suitable</option>
                      <option value="unsuitable">Unsuitable</option>
                    </select>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="text-label">Recruiter Notes</label>
                      <button onClick={() => saveRecruiterNote(c.resumeId, noteText)} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
                        <Save style={{ width: 11, height: 11 }} /> Save
                      </button>
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Private feedback or interview notes…"
                      className="textarea-glass"
                      style={{ minHeight: 72, fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Raw Text */}
            {activeTab === 'rawText' && (
              <div style={{
                padding: '1.25rem',
                background: 'rgba(7,11,20,0.85)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                maxHeight: 500,
                overflowY: 'auto',
              }}>
                {c.rawText || 'No raw text available.'}
              </div>
            )}

            {/* Tab: Sections */}
            {activeTab === 'sections' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['summary', 'skills', 'experience', 'education', 'projects', 'certifications'].map((key) => {
                  const text = c.sections?.[`${key}_text`];
                  if (!text) return null;
                  return (
                    <div key={key} style={{ padding: '1rem', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <h4 className="text-label" style={{ marginBottom: '0.5rem', color: 'var(--brand-indigo)' }}>
                        {key.toUpperCase()} SECTION
                      </h4>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .report-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
