import React, { useState } from 'react';
import { BookOpen, Search, Plus, Download, Upload, Trash2, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScreening } from '../context/ScreeningContext';

const CATEGORIES = [
  { value: 'programming', label: 'Programming Language' },
  { value: 'frontend', label: 'Frontend Framework' },
  { value: 'backend', label: 'Backend Framework' },
  { value: 'database', label: 'Database' },
  { value: 'data', label: 'Data / ML' },
  { value: 'devops', label: 'DevOps / Cloud' },
  { value: 'api', label: 'API Protocol' },
  { value: 'methodology', label: 'Methodology' },
];

const CATEGORY_COLORS = {
  programming: { color: '#a5b4fc', bg: 'rgba(79,70,229,0.12)', border: 'rgba(79,70,229,0.25)' },
  frontend: { color: '#5eead4', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)' },
  backend: { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  database: { color: '#fca5a5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  data: { color: '#c4b5fd', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  devops: { color: '#86efac', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.22)' },
  api: { color: '#93c5fd', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  methodology: { color: '#fdba74', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
};

function CategoryBadge({ cat }) {
  const c = CATEGORY_COLORS[cat] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.20)' };
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
      padding: '0.15rem 0.55rem',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-full)',
      whiteSpace: 'nowrap',
    }}>
      {cat}
    </span>
  );
}

export default function SkillDictionaryEditor() {
  const navigate = useNavigate();
  const { skillsDictionary, fetchSkillDictionary, jobDescription, showToast } = useScreening();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);
  const [newCanonical, setNewCanonical] = useState('');
  const [newCategory, setNewCategory] = useState('programming');
  const [newVariants, setNewVariants] = useState('');

  // Skills referenced in the parsed JD (for "Used in JD" badge)
  const jdSkills = new Set([
    ...((jobDescription.parsedRequirements?.mandatorySkills) || []),
    ...((jobDescription.parsedRequirements?.preferredSkills) || []),
  ].map((s) => s.toLowerCase()));

  const filtered = skillsDictionary.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.canonicalName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.variants && s.variants.some((v) => v.toLowerCase().includes(q)))
    );
  });

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newCanonical.trim()) return;
    try {
      const variantsArr = newVariants.split(',').map((v) => v.trim()).filter(Boolean);
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canonicalName: newCanonical.trim(), category: newCategory, variants: variantsArr }),
      });
      if (res.ok) {
        showToast(`Skill '${newCanonical}' added!`, 'success');
        setNewCanonical('');
        setNewVariants('');
        setShowAddRow(false);
        fetchSkillDictionary();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add skill.', 'error');
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Delete skill '${name}'?`)) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast(`Deleted '${name}'.`, 'success'); fetchSkillDictionary(); }
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleExport = () => window.open('/api/skills/export', '_blank');

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const res = await fetch('/api/skills/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        if (res.ok) { showToast('Dictionary imported!', 'success'); fetchSkillDictionary(); }
      } catch { showToast('Invalid JSON file.', 'error'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: 22, height: 22, color: 'var(--brand-indigo)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Skill Dictionary</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                {skillsDictionary.length} canonical skills with phrase variant mappings
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAddRow(!showAddRow)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
              <Plus style={{ width: 15, height: 15 }} />
              Add Skill
            </button>
            <button onClick={handleExport} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              <Download style={{ width: 14, height: 14 }} />
              Export
            </button>
            <label className="btn-secondary" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
              <Upload style={{ width: 14, height: 14 }} />
              Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search style={{ width: 15, height: 15, color: 'var(--text-dim)', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            id="skill-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search canonical name, category, or variant alias..."
            className="input-glass"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Add Skill inline row */}
        {showAddRow && (
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(79,70,229,0.35)' }}>
            <form onSubmit={handleAddSkill} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 3fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Canonical Name</label>
                <input
                  type="text"
                  id="new-skill-canonical"
                  value={newCanonical}
                  onChange={(e) => setNewCanonical(e.target.value)}
                  placeholder="e.g. rust"
                  className="input-glass"
                  required
                />
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="select-glass" id="new-skill-category">
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Variants (comma-separated)</label>
                <input
                  type="text"
                  value={newVariants}
                  onChange={(e) => setNewVariants(e.target.value)}
                  placeholder="e.g. rust lang, rust programming, rustlang"
                  className="input-glass"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: 2 }}>
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}>
                  Save
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowAddRow(false)}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table zebra" aria-label="Skill dictionary entries">
              <thead>
                <tr>
                  <th style={{ width: 200 }}>Canonical Skill</th>
                  <th style={{ width: 130 }}>Category</th>
                  <th>Phrase Variants / Aliases</th>
                  <th style={{ textAlign: 'right', width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const inJD = jdSkills.has(s.canonicalName.toLowerCase());
                  return (
                    <tr key={s.id || s.canonicalName}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {/* Left accent bar for JD-used skills */}
                          {inJD && (
                            <div style={{ width: 3, height: 28, borderRadius: 99, background: 'var(--gradient-brand)', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: inJD ? '#a5b4fc' : 'var(--text-primary)' }}>
                              {s.canonicalName}
                            </div>
                            {inJD && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--brand-indigo)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Used in JD
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <CategoryBadge cat={s.category} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(s.variants || [s.canonicalName]).map((v) => (
                            <span key={v} className="chip chip-general" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {s.id && (
                          <button
                            onClick={() => handleDeleteSkill(s.id, s.canonicalName)}
                            className="btn-danger"
                            style={{ padding: '0.3rem 0.5rem' }}
                            aria-label={`Delete ${s.canonicalName}`}
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      No skill entries matching "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sticky footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border)',
            background: 'rgba(15,23,42,0.7)',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {skillsDictionary.length} skills
            </span>
            <button onClick={() => navigate('/resume-upload')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.6rem 1.5rem' }}>
              Continue to Resume Upload
              <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
