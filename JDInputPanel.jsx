import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Upload, ArrowRight, Type } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

const SAMPLE_JD = `Senior Full-Stack Software Developer

About the Role:
We are looking for a Senior Full-Stack Developer to join our engineering team.

Required Skills (Must Have):
- Python (backend services and data pipelines)
- SQL (PostgreSQL preferred)
- Docker (containerization and deployment)
- Git (version control, GitHub workflows)
- REST API design and development
- Minimum 3 years of professional software development experience
- Bachelor's degree in Computer Science or related field

Preferred Skills (Nice to Have):
- React.js (frontend development)
- TypeScript
- AWS (cloud deployment)
- Machine Learning (ML model integration)
- Agile/Scrum methodology`;

export default function JDInputPanel() {
  const { parseJD, loading, jobDescription } = useScreening();
  const [tab, setTab] = useState('paste'); // 'paste' | 'upload'
  const [title, setTitle] = useState(jobDescription.title || '');
  const [rawText, setRawText] = useState(jobDescription.rawText || '');
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    await parseJD(rawText, title);
    navigate('/jd-review');
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setRawText(evt.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const loadSample = () => {
    setTitle('Senior Full-Stack Software Developer');
    setRawText(SAMPLE_JD);
  };

  const charCount = rawText.length;
  const lineCount = rawText.split('\n').filter(Boolean).length;

  return (
    <div className="app-container">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText style={{ width: 22, height: 22, color: 'var(--brand-indigo)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Job Description Input</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Paste or upload a .txt JD to extract ranked requirements
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Job Title */}
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Job Title</label>
              <input
                id="jd-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="input-glass"
                required
              />
            </div>

            {/* Tab toggle */}
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Job Description Content</label>
              <div className="seg-control" style={{ marginBottom: '1rem' }}>
                <button type="button" onClick={() => setTab('paste')} className={tab === 'paste' ? 'active' : ''}>
                  <Type style={{ width: 13, height: 13, display: 'inline', marginRight: 5 }} />
                  Paste Text
                </button>
                <button type="button" onClick={() => setTab('upload')} className={tab === 'upload' ? 'active' : ''}>
                  <Upload style={{ width: 13, height: 13, display: 'inline', marginRight: 5 }} />
                  Upload File
                </button>
              </div>

              {tab === 'paste' && (
                <div>
                  <textarea
                    id="jd-text"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste complete Job Description here..."
                    className="textarea-glass"
                    style={{ minHeight: 260 }}
                    required
                  />
                  {rawText && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{charCount.toLocaleString()} chars</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{lineCount} lines</span>
                    </div>
                  )}
                </div>
              )}

              {tab === 'upload' && (
                <label
                  className={`drop-zone ${dragging ? 'drag-active' : ''}`}
                  style={{ cursor: 'pointer', minHeight: 220 }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload style={{ width: 40, height: 40, color: 'var(--brand-indigo)', opacity: 0.7 }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                      {rawText ? 'File loaded — drop another to replace' : 'Drop a .txt file here'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      or <span style={{ color: 'var(--brand-indigo)', textDecoration: 'underline' }}>click to browse</span>
                    </div>
                  </div>
                  {rawText && (
                    <div style={{
                      fontSize: '0.75rem', color: 'var(--accent-teal)',
                      background: 'rgba(20,184,166,0.10)', border: '1px solid rgba(20,184,166,0.25)',
                      borderRadius: 8, padding: '0.3rem 0.75rem',
                    }}>
                      ✓ {charCount.toLocaleString()} chars loaded
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".txt"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button
                id="parse-jd-btn"
                type="submit"
                disabled={loading || !rawText.trim()}
                className="btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spinSlow 0.8s linear infinite', display: 'inline-block' }} />
                    Parsing…
                  </span>
                ) : (
                  <>Parse JD &amp; Review <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
