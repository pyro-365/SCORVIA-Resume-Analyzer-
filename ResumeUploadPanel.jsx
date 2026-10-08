import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Sparkles, CheckCircle2, Play, Plus, X, Trash2 } from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

const SAMPLE_RESUMES = [
  {
    fileName: 'resume_01_alice_johnson.txt',
    rawText: `Alice Johnson\nalice.johnson@email.com | LinkedIn: linkedin.com/in/alicejohnson\n\nProfessional Summary\nSenior software developer with 5 years of experience building scalable backend services and data pipelines. Strong expertise in Python, Docker, and REST API development.\n\nTechnical Skills\nPython, SQL, PostgreSQL, Docker, Git, GitHub, REST API, React.js, TypeScript, Agile, Scrum\n\nWork Experience\nSenior Developer — TechCorp Inc. (2019–2024)\n- Developed REST APIs using Python and Django\n- Containerized services using Docker and Kubernetes\n- Designed and optimized PostgreSQL database schemas\n- Worked in Agile/Scrum teams with Git-based workflows\n\nSoftware Engineer — StartupXYZ (2017–2019)\n- Built React.js frontend components\n- Integrated TypeScript into the codebase\n\nEducation\nB.Tech in Computer Science — State University (2017)\n\nCertifications\nAWS Certified Developer\nDocker Certified Associate`,
  },
  {
    fileName: 'resume_02_bob_martinez.txt',
    rawText: `Bob Martinez\nbob.martinez@email.com\n\nSummary\nJunior software developer with 1 year of experience. Familiar with Python basics and SQL.\n\nSkills\nPython, SQL, HTML, CSS, JavaScript\n\nExperience\nJunior Developer — WebAgency (2023–2024)\n- Built basic HTML/CSS/JavaScript web pages\n- Wrote simple Python scripts for data processing\n- No experience with Docker or containerization\n- Limited knowledge of Git workflows\n\nEducation\nBachelor of Science in Information Technology — City College (2023)`,
  },
  {
    fileName: 'resume_03_carlos_rivera.txt',
    rawText: `Carlos Rivera\ncarlos.rivera@email.com\n\nSummary\nRecently graduated looking for entry-level position.\n\nSkills\nMicrosoft Word, Excel, PowerPoint, basic HTML\n\nExperience\nData Entry Clerk — OfficeWorks (2022–2024)\n- Managed spreadsheets and data entry tasks\n- No software development experience\n\nEducation\nHigh School Certificate — Riverside High School (2021)`,
  },
];

export default function ResumeUploadPanel() {
  const { uploadResumes, executeScreening, resumes, loading, showToast, removeResume } = useScreening();
  const navigate = useNavigate();

  const [filesToUpload, setFilesToUpload] = useState([]);
  const [pasteText, setPasteText] = useState('');
  const [pasteFileName, setPasteFileName] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = (fileList) => {
    const valid = fileList.filter((f) => (f.name || f.fileName || '').endsWith('.txt'));
    if (valid.length < fileList.length) {
      showToast('Only .txt files are supported.', 'error');
    }
    if (valid.length > 0) setFilesToUpload((p) => [...p, ...valid]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const removeFile = (idx) => setFilesToUpload((p) => p.filter((_, i) => i !== idx));

  const loadSampleResumes = () => {
    setFilesToUpload(SAMPLE_RESUMES);
    showToast('3 sample resumes loaded!', 'info');
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    const name = pasteFileName.trim() || `pasted_resume_${filesToUpload.length + 1}.txt`;
    setFilesToUpload((p) => [...p, { fileName: name, rawText: pasteText }]);
    setPasteText('');
    setPasteFileName('');
    setShowPasteModal(false);
  };

  const handleUploadAndRun = async () => {
    if (filesToUpload.length === 0 && resumes.length === 0) {
      showToast('Please add at least one .txt resume.', 'error');
      return;
    }
    try {
      if (filesToUpload.length > 0) await uploadResumes(filesToUpload);
      navigate('/processing');
      await executeScreening();
      navigate('/results');
    } catch (e) {
      console.error(e);
    }
  };

  const totalCount = filesToUpload.length + resumes.length;

  return (
    <div className="app-container">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload style={{ width: 22, height: 22, color: 'var(--accent-teal)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Resume Upload</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Batch upload .txt candidate resumes for screening
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Drop Zone */}
          <label
            className={`drop-zone ${dragging ? 'drag-active' : ''}`}
            style={{ cursor: 'pointer', minHeight: '36vh' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <img
              src="/illustrations/empty_upload.png"
              alt="Upload resumes illustration"
              style={{ width: 120, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(79,70,229,0.35))' }}
            />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.3rem', fontSize: '1rem' }}>
                Drop .txt candidate resumes here
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                or{' '}
                <span style={{ color: 'var(--brand-indigo)', textDecoration: 'underline' }}>click to browse</span>
                {' '}— supports batch select
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', pointerEvents: 'none' }}>
                Browse Files
              </span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowPasteModal(true); }}
                className="btn-ghost"
                style={{ fontSize: '0.78rem' }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Paste Text
              </button>
            </div>
            <input type="file" multiple accept=".txt" onChange={handleFileInput} style={{ display: 'none' }} />
          </label>

          {/* File List */}
          {totalCount > 0 && (
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span className="text-label">
                  Staged Resumes <span style={{ color: 'var(--brand-indigo)', fontWeight: 800 }}>({totalCount})</span>
                </span>
                {filesToUpload.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilesToUpload([])}
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem', color: 'var(--danger-coral)' }}
                  >
                    <Trash2 style={{ width: 12, height: 12 }} /> Clear staged
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 260, overflowY: 'auto' }}>
                {/* Already uploaded */}
                {resumes.map((r) => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.20)',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <span className="status-dot status-dot-green" />
                    <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--accent-teal)', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{r.file_name || r.fileName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Uploaded</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeResume(r.id);
                        showToast(`Removed ${r.file_name || r.fileName}`, 'info');
                      }}
                      className="btn-ghost"
                      title="Remove this resume"
                      style={{
                        padding: '3px 5px',
                        color: 'var(--danger-coral)',
                        opacity: 0.7,
                        transition: 'opacity 0.15s ease, transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
                      aria-label={`Remove ${r.file_name || r.fileName}`}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}

                {/* Staged for upload */}
                {filesToUpload.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    background: 'var(--bg-glass)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <span className="status-dot status-dot-blue" />
                    <FileText style={{ width: 14, height: 14, color: 'var(--brand-indigo)', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{f.name || f.fileName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {f.size ? `${(f.size / 1024).toFixed(1)} KB` : 'Pasted'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="btn-ghost"
                      title="Remove this resume"
                      style={{
                        padding: '3px 5px',
                        color: 'var(--danger-coral)',
                        opacity: 0.7,
                        transition: 'opacity 0.15s ease, transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; }}
                      aria-label={`Remove ${f.name || f.fileName}`}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sticky footer action bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '1rem', borderTop: '1px solid var(--border)',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {totalCount > 0
                ? <><span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalCount}</span> resume{totalCount !== 1 ? 's' : ''} ready to screen</>
                : 'No resumes staged — add files to begin'
              }
            </div>
            <button
              id="run-screening-btn"
              onClick={handleUploadAndRun}
              disabled={loading || totalCount === 0}
              className="btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              <Play style={{ width: 16, height: 16, fill: 'white' }} />
              Run Screening
            </button>
          </div>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="glass-card" style={{
            maxWidth: 520, width: '100%', padding: '2rem',
            border: '1px solid rgba(79,70,229,0.35)',
            animation: 'slideUp 0.3s ease forwards',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Paste Resume Text</h3>
              <button className="btn-ghost" style={{ padding: '4px' }} onClick={() => setShowPasteModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate Name / File ID</label>
                <input
                  type="text"
                  value={pasteFileName}
                  onChange={(e) => setPasteFileName(e.target.value)}
                  placeholder="e.g. resume_jane_doe.txt"
                  className="input-glass"
                />
              </div>

              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Resume Content</label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste complete resume content here..."
                  className="textarea-glass"
                  style={{ minHeight: 200 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setShowPasteModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handlePasteSubmit} className="btn-primary" disabled={!pasteText.trim()}>
                  Add Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
