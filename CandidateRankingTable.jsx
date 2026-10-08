import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Search, Download, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, SlidersHorizontal, Trash2
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

function RecommendationBadge({ rec }) {
  if (rec === 'Suitable') {
    return (
      <span className="badge badge-suitable" aria-label="Suitable candidate">
        <CheckCircle2 style={{ width: 11, height: 11 }} /> Suitable
      </span>
    );
  }
  if (rec === 'Partially suitable') {
    return (
      <span className="badge badge-partial" aria-label="Partially suitable candidate">
        <AlertTriangle style={{ width: 11, height: 11 }} /> Partial
      </span>
    );
  }
  return (
    <span className="badge badge-unsuitable" aria-label="Not suitable candidate">
      <XCircle style={{ width: 11, height: 11 }} /> Not Suitable
    </span>
  );
}

function SegmentedBar({ score }) {
  // score: 0-100. Show breakdown: 50% mandatory, 25% preferred, 15% exp, 10% edu
  // For display, approximate visual breakdown proportionally
  const m = Math.min(score * 0.55, 55);
  const p = Math.min(score * 0.25, 25);
  const e = Math.min(score * 0.13, 13);
  const ed = Math.min(score * 0.07, 7);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', minWidth: 38, textAlign: 'right', color: score >= 70 ? 'var(--accent-teal)' : score >= 45 ? 'var(--warning-amber)' : 'var(--danger-coral)' }}>
        {score}%
      </span>
      <div style={{ flex: 1, display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', gap: 1.5, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ width: `${m}%`, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 2 }} />
        <div style={{ width: `${p}%`, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', borderRadius: 2 }} />
        <div style={{ width: `${e}%`, background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 2 }} />
        <div style={{ width: `${ed}%`, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function CandidateRankingTable() {
  const { results, jobDescription, submitManualLabel, removeCandidateResult, clearAllResults } = useScreening();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRec, setFilterRec] = useState('ALL');
  const [sortBy, setSortBy] = useState('rank');

  const filtered = results.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.fileName.toLowerCase().includes(q) ||
      (r.matchedMandatory && r.matchedMandatory.some((m) => m.toLowerCase().includes(q)));
    const matchesRec = filterRec === 'ALL' || r.recommendation.toUpperCase().replace(/\s+/g, '_') === filterRec;
    return matchesSearch && matchesRec;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.finalScore - a.finalScore;
    if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
    return a.rank - b.rank;
  });

  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = ['Rank', 'File Name', 'Score %', 'Recommendation', 'Matched Mandatory', 'Missing Mandatory', 'Experience Yrs', 'Education'];
    const rows = results.map((r) => [
      r.rank,
      `"${r.fileName}"`,
      r.finalScore,
      `"${r.recommendation}"`,
      `"${(r.matchedMandatory || []).join(', ')}"`,
      `"${(r.missingMandatory || []).join(', ')}"`,
      r.detectedExperienceYears || 0,
      `"${r.detectedEducation || ''}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `screening_${(jobDescription.title || 'results').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 style={{ width: 22, height: 22, color: 'var(--brand-indigo)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Candidate Rankings</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                {results.length} candidates screened for:{' '}
                <strong style={{ color: 'var(--brand-indigo)' }}>{jobDescription.title || 'Selected Position'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportCSV} disabled={results.length === 0} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <Download style={{ width: 15, height: 15 }} />
              Export CSV
            </button>
            <button onClick={clearAllResults} disabled={results.length === 0} className="btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--danger-coral)' }}>
              <Trash2 style={{ width: 14, height: 14 }} />
              Clear All Results
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search style={{ width: 14, height: 14, color: 'var(--text-dim)', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              id="candidate-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name or skill..."
              className="input-glass"
              style={{ paddingLeft: 32, fontSize: '0.82rem', padding: '0.5rem 0.9rem 0.5rem 2rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal style={{ width: 13, height: 13, color: 'var(--text-dim)' }} />
            <span className="text-label" style={{ whiteSpace: 'nowrap' }}>Filter:</span>
          </div>

          <select
            id="filter-recommendation"
            value={filterRec}
            onChange={(e) => setFilterRec(e.target.value)}
            className="select-glass"
            style={{ flex: '0 1 170px', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
          >
            <option value="ALL">All Recommendations</option>
            <option value="SUITABLE">Suitable Only</option>
            <option value="PARTIALLY_SUITABLE">Partially Suitable</option>
            <option value="NOT_SUITABLE">Not Suitable</option>
          </select>

          <select
            id="sort-candidates"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-glass"
            style={{ flex: '0 1 160px', fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Score bar legend */}
          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {[
              { color: '#7c3aed', label: 'Mandatory' },
              { color: '#14b8a6', label: 'Preferred' },
              { color: '#f59e0b', label: 'Experience' },
              { color: '#818cf8', label: 'Education' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        {sorted.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src="/illustrations/empty_results.png"
              alt="No results yet — clipboard with magnifier"
              style={{ width: 120, height: 120, objectFit: 'contain', opacity: 0.8 }}
            />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                {results.length === 0 ? 'No candidates screened yet' : 'No matches for current filter'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {results.length === 0
                  ? 'Upload resumes and run screening to see ranked results here.'
                  : 'Try adjusting the search or filter criteria.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table zebra" aria-label="Candidate ranking results">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: 60 }}>Rank</th>
                    <th>Candidate</th>
                    <th style={{ minWidth: 220 }}>Score Breakdown</th>
                    <th>Recommendation</th>
                    <th>Matched Skills</th>
                    <th>Ground Truth</th>
                    <th style={{ textAlign: 'right', width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, idx) => (
                    <tr
                      key={r.scoreId || r.resumeId}
                      onClick={() => navigate(`/results/${r.resumeId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <div className="rank-circle" style={{ margin: '0 auto' }}>
                          {r.rank}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: 200 }} className="truncate">
                          {r.fileName}
                        </div>
                        {r.detectedExperienceYears > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {r.detectedExperienceYears} yrs exp · {r.detectedEducation || 'N/A'}
                          </div>
                        )}
                      </td>

                      <td>
                        <SegmentedBar score={r.finalScore} />
                      </td>

                      <td>
                        <RecommendationBadge rec={r.recommendation} />
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(r.matchedMandatory || []).slice(0, 3).map((skill) => (
                            <span key={skill} className="chip chip-mandatory" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                              {skill}
                            </span>
                          ))}
                          {(r.matchedMandatory || []).length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>+{r.matchedMandatory.length - 3}</span>
                          )}
                          {(r.matchedMandatory || []).length === 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None</span>
                          )}
                        </div>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          id={`label-${r.resumeId}`}
                          value={r.manualLabel || ''}
                          onChange={(e) => submitManualLabel(r.resumeId, e.target.value)}
                          className="select-glass"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', width: 130 }}
                        >
                          <option value="">Set label…</option>
                          <option value="suitable">Suitable</option>
                          <option value="partially suitable">Partial</option>
                          <option value="unsuitable">Unsuitable</option>
                        </select>
                      </td>

                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/results/${r.resumeId}`)}
                            className="btn-ghost"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', color: 'var(--brand-indigo)' }}
                          >
                            View <ChevronRight style={{ width: 14, height: 14 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCandidateResult(r.resumeId || r.id)}
                            className="btn-ghost"
                            style={{ padding: '0.35rem 0.45rem', color: 'var(--danger-coral)', opacity: 0.8 }}
                            title="Delete candidate result"
                            aria-label={`Delete ${r.fileName}`}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
