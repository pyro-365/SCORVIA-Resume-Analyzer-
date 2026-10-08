import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, CheckCircle2, Plus, X, ArrowRight, ArrowLeft, ShieldCheck, Star
} from 'lucide-react';
import { useScreening } from '../context/ScreeningContext';

function SkillGroup({ label, icon: Icon, chipClass, color, bg, borderColor, items, newVal, setNewVal, onAdd, onRemove }) {
  return (
    <div style={{
      padding: '1.25rem',
      borderRadius: 'var(--radius-lg)',
      background: bg,
      border: `1px solid ${borderColor}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icon style={{ width: 15, height: 15 }} /> {label}
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          {items.length} skill{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem', minHeight: 36 }}>
        {items.length === 0 && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None detected — add below</span>
        )}
        {items.map((skill) => (
          <span key={skill} className={`chip ${chipClass}`}>
            {skill}
            <button
              type="button"
              onClick={() => onRemove(skill)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex', padding: 0 }}
              aria-label={`Remove ${skill}`}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          placeholder={`Add ${label.toLowerCase().split(' ')[0]} skill…`}
          className="input-glass"
          style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
        />
        <button type="button" onClick={onAdd} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', whiteSpace: 'nowrap' }}>
          <Plus style={{ width: 14, height: 14 }} /> Add
        </button>
      </div>
    </div>
  );
}

export default function RequirementsSummary() {
  const { jobDescription, updateRequirements, loading } = useScreening();
  const navigate = useNavigate();

  const reqs = jobDescription.parsedRequirements || {
    mandatorySkills: [],
    preferredSkills: [],
    minExperienceYears: 0,
    minEducation: '',
  };

  const [mandatory, setMandatory] = useState(reqs.mandatorySkills || []);
  const [preferred, setPreferred] = useState(reqs.preferredSkills || []);
  const [minExp, setMinExp] = useState(reqs.minExperienceYears || 0);
  const [minEdu, setMinEdu] = useState(reqs.minEducation || 'bachelors');
  const [newMandatory, setNewMandatory] = useState('');
  const [newPreferred, setNewPreferred] = useState('');

  const addMandatory = () => {
    const s = newMandatory.toLowerCase().trim();
    if (s && !mandatory.includes(s)) setMandatory([...mandatory, s]);
    setNewMandatory('');
  };

  const addPreferred = () => {
    const s = newPreferred.toLowerCase().trim();
    if (s && !preferred.includes(s)) setPreferred([...preferred, s]);
    setNewPreferred('');
  };

  const handleConfirm = async () => {
    await updateRequirements({
      mandatorySkills: mandatory,
      preferredSkills: preferred,
      minExperienceYears: parseInt(minExp, 10) || 0,
      minEducation: minEdu,
    });
    navigate('/resume-upload');
  };

  return (
    <div className="app-container">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu style={{ width: 22, height: 22, color: 'var(--accent-teal)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Requirements Review</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              Auto-extracted from: <strong style={{ color: 'var(--brand-indigo)' }}>{jobDescription.title || 'Job Description'}</strong>
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Skill groups */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <SkillGroup
              label="Mandatory Skills"
              icon={CheckCircle2}
              chipClass="chip-mandatory"
              color="#a5b4fc"
              bg="rgba(79,70,229,0.08)"
              borderColor="rgba(79,70,229,0.20)"
              items={mandatory}
              newVal={newMandatory}
              setNewVal={setNewMandatory}
              onAdd={addMandatory}
              onRemove={(s) => setMandatory(mandatory.filter((x) => x !== s))}
            />
            <SkillGroup
              label="Preferred Skills"
              icon={Star}
              chipClass="chip-preferred"
              color="#5eead4"
              bg="rgba(20,184,166,0.08)"
              borderColor="rgba(20,184,166,0.20)"
              items={preferred}
              newVal={newPreferred}
              setNewVal={setNewPreferred}
              onAdd={addPreferred}
              onRemove={(s) => setPreferred(preferred.filter((x) => x !== s))}
            />
          </div>

          {/* Experience & Education */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
            padding: '1.25rem',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Min. Experience (years)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="input-glass"
                id="min-experience"
              />
            </div>
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Min. Education Level
              </label>
              <select
                value={minEdu}
                onChange={(e) => setMinEdu(e.target.value)}
                className="select-glass"
                id="min-education"
              >
                <option value="">None / Unspecified</option>
                <option value="highschool">High School</option>
                <option value="diploma">Diploma / Associate</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD / Doctorate</option>
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-teal)' }}>
              <ShieldCheck style={{ width: 14, height: 14 }} />
              Deterministic criteria — no AI inference
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => navigate('/jd-input')} className="btn-ghost">
                <ArrowLeft style={{ width: 15, height: 15 }} />
                Back
              </button>
              <button
                id="confirm-requirements-btn"
                type="button"
                onClick={handleConfirm}
                disabled={loading || (mandatory.length === 0 && preferred.length === 0)}
                className="btn-primary"
              >
                Confirm & Continue
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .req-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
