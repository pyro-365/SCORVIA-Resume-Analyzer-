import React, { useEffect } from 'react';
import { Award, ShieldCheck, Target, RefreshCw, BarChart2, AlertCircle, Info } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

function MetricCard({ value, label, formula, color, bg, border, icon: Icon }) {
  return (
    <div className="metric-card" style={{ background: bg, borderColor: border, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Icon style={{ width: 14, height: 14, color }} />
        <span className="metric-card-label" style={{ color }}>{label}</span>
      </div>
      <div className="metric-card-value" style={{ color }}>{value}%</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
        {formula}
      </div>
    </div>
  );
}

export default function EvaluationMetricsPanel() {
  const { evaluationMetrics, fetchEvaluationMetrics, currentRunId } = useScreening();

  useEffect(() => {
    if (currentRunId) fetchEvaluationMetrics(currentRunId);
  }, [currentRunId]);

  const metrics = evaluationMetrics?.metrics || { precision: 0, recall: 0, f1: 0, accuracy: 0 };
  const cm = evaluationMetrics?.confusionMatrix || { tp: 0, fp: 0, fn: 0, tn: 0 };
  const noLabels = evaluationMetrics?.totalLabeled === 0;

  const METRIC_CARDS = [
    {
      value: metrics.precision,
      label: 'Precision',
      formula: 'TP / (TP + FP)',
      color: '#a5b4fc',
      bg: 'rgba(79,70,229,0.10)',
      border: 'rgba(79,70,229,0.25)',
      icon: Target,
    },
    {
      value: metrics.recall,
      label: 'Recall',
      formula: 'TP / (TP + FN)',
      color: '#5eead4',
      bg: 'rgba(20,184,166,0.10)',
      border: 'rgba(20,184,166,0.25)',
      icon: BarChart2,
    },
    {
      value: metrics.f1,
      label: 'F1 Score',
      formula: '2×P×R / (P+R)',
      color: '#fcd34d',
      bg: 'rgba(245,158,11,0.10)',
      border: 'rgba(245,158,11,0.25)',
      icon: Award,
    },
    {
      value: metrics.accuracy,
      label: 'Accuracy',
      formula: '(TP+TN) / Total',
      color: '#94a3b8',
      bg: 'rgba(148,163,184,0.08)',
      border: 'rgba(148,163,184,0.18)',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="app-container">
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award style={{ width: 22, height: 22, color: 'var(--warning-amber)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>System Accuracy Evaluation</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Precision, Recall &amp; F1 against manual recruiter ground-truth labels
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchEvaluationMetrics(currentRunId)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem' }}
            disabled={!currentRunId}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Recalculate
          </button>
        </div>

        {/* No-labels warning */}
        {noLabels && (
          <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '1rem 1.25rem',
            background: 'rgba(245,158,11,0.10)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle style={{ width: 18, height: 18, color: 'var(--warning-amber)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning-amber)', marginBottom: 3 }}>
                No Ground-Truth Labels Assigned
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assign manual labels on the Rankings page or in each Candidate Report to enable metric calculation.
              </p>
            </div>
          </div>
        )}

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {METRIC_CARDS.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Confusion matrix */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Confusion Matrix</h3>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Info style={{ width: 14, height: 14, color: 'var(--text-secondary)', cursor: 'help' }} title="Ground-truth vs system recommendation classification breakdown" />
            </div>
          </div>

          <div style={{ maxWidth: 480 }}>
            <table className="data-table" style={{ textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Actual ↓ / Predicted →</th>
                  <th style={{ color: 'var(--accent-teal)' }}>Predicted Suitable</th>
                  <th style={{ color: 'var(--danger-coral)' }}>Predicted Unsuitable</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>Actual Suitable</td>
                  <td style={{ background: 'rgba(20,184,166,0.12)', color: '#5eead4', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                    TP = {cm.tp}
                  </td>
                  <td style={{ background: 'rgba(239,68,68,0.10)', color: '#fca5a5', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                    FN = {cm.fn}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>Actual Unsuitable</td>
                  <td style={{ background: 'rgba(245,158,11,0.10)', color: '#fcd34d', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                    FP = {cm.fp}
                  </td>
                  <td style={{ background: 'rgba(148,163,184,0.06)', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
                    TN = {cm.tn}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Metric legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { label: 'TP — True Positive', color: '#5eead4' },
              { label: 'FP — False Positive', color: '#fcd34d' },
              { label: 'FN — False Negative', color: '#fca5a5' },
              { label: 'TN — True Negative', color: 'var(--text-secondary)' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
