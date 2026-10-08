'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');

function uuid() {
  return crypto.randomUUID();
}

// GET /api/runs/:id/results — Ranked list of candidate results
router.get('/runs/:id/results', (req, res) => {
  const { id: runId } = req.params;
  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(runId);

  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  const scores = db.prepare(`
    SELECT sr.*, r.file_name, r.detected_experience_years, r.detected_education, ml.label as manual_label, rn.note_text
    FROM score_results sr
    JOIN resumes r ON sr.resume_id = r.id
    LEFT JOIN manual_labels ml ON ml.run_id = sr.run_id AND ml.resume_id = sr.resume_id
    LEFT JOIN recruiter_notes rn ON rn.resume_id = sr.resume_id
    WHERE sr.run_id = ?
    ORDER BY sr.rank ASC
  `).all(runId);

  const matchedSkillsStmt = db.prepare('SELECT skill_name, is_mandatory FROM matched_skills WHERE score_id = ?');
  const missingSkillsStmt = db.prepare('SELECT skill_name, is_mandatory FROM missing_skills WHERE score_id = ?');

  const results = scores.map((s) => {
    const matched = matchedSkillsStmt.all(s.id);
    const missing = missingSkillsStmt.all(s.id);

    return {
      scoreId: s.id,
      resumeId: s.resume_id,
      fileName: s.file_name,
      rank: s.rank,
      finalScore: s.final_score,
      mandatoryScore: s.mandatory_score,
      preferredScore: s.preferred_score,
      experienceScore: s.experience_score,
      educationScore: s.education_score,
      penaltyApplied: s.penalty_applied,
      recommendation: s.recommendation,
      detectedExperienceYears: s.detected_experience_years,
      detectedEducation: s.detected_education,
      matchedMandatory: matched.filter((m) => m.is_mandatory === 1).map((m) => m.skill_name),
      matchedPreferred: matched.filter((m) => m.is_mandatory === 0).map((m) => m.skill_name),
      missingMandatory: missing.filter((m) => m.is_mandatory === 1).map((m) => m.skill_name),
      missingPreferred: missing.filter((m) => m.is_mandatory === 0).map((m) => m.skill_name),
      manualLabel: s.manual_label || null,
      noteText: s.note_text || '',
    };
  });

  return res.json({
    runId,
    status: run.status,
    candidatesCount: results.length,
    results,
  });
});

// GET /api/runs/:id/results/:candidateId — Full match report card for single candidate
router.get('/runs/:id/results/:candidateId', (req, res) => {
  const { id: runId, candidateId } = req.params;

  const score = db.prepare(`
    SELECT sr.*, r.file_name, r.raw_text, r.detected_experience_years, r.detected_education, ml.label as manual_label, rn.note_text
    FROM score_results sr
    JOIN resumes r ON sr.resume_id = r.id
    LEFT JOIN manual_labels ml ON ml.run_id = sr.run_id AND ml.resume_id = sr.resume_id
    LEFT JOIN recruiter_notes rn ON rn.resume_id = sr.resume_id
    WHERE sr.run_id = ? AND (sr.resume_id = ? OR sr.id = ?)
  `).get(runId, candidateId, candidateId);

  if (!score) {
    return res.status(404).json({ error: 'Candidate result not found for this screening run.' });
  }

  const sections = db.prepare('SELECT * FROM resume_sections WHERE resume_id = ?').get(score.resume_id);
  const matched = db.prepare('SELECT skill_name, is_mandatory FROM matched_skills WHERE score_id = ?').all(score.id);
  const missing = db.prepare('SELECT skill_name, is_mandatory FROM missing_skills WHERE score_id = ?').all(score.id);
  const explanations = db.prepare('SELECT explanation_text FROM explanations WHERE score_id = ? ORDER BY line_index ASC').all(score.id).map((e) => e.explanation_text);

  return res.json({
    scoreId: score.id,
    resumeId: score.resume_id,
    fileName: score.file_name,
    rank: score.rank,
    finalScore: score.final_score,
    recommendation: score.recommendation,
    scoresBreakdown: {
      mandatory: score.mandatory_score,
      preferred: score.preferred_score,
      experience: score.experience_score,
      education: score.education_score,
      penalty: score.penalty_applied,
    },
    matchedMandatory: matched.filter((m) => m.is_mandatory === 1).map((m) => m.skill_name),
    matchedPreferred: matched.filter((m) => m.is_mandatory === 0).map((m) => m.skill_name),
    missingMandatory: missing.filter((m) => m.is_mandatory === 1).map((m) => m.skill_name),
    missingPreferred: missing.filter((m) => m.is_mandatory === 0).map((m) => m.skill_name),
    detectedExperienceYears: score.detected_experience_years,
    detectedEducation: score.detected_education,
    explanationBullets: explanations,
    rawText: score.raw_text,
    sections: sections || {},
    manualLabel: score.manual_label || null,
    recruiterNote: score.note_text || '',
  });
});

// POST /api/resumes/:resumeId/notes — Save/update recruiter note
router.post('/resumes/:resumeId/notes', (req, res) => {
  const { resumeId } = req.params;
  const { noteText = '' } = req.body;

  const resume = db.prepare('SELECT id FROM resumes WHERE id = ?').get(resumeId);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const existing = db.prepare('SELECT id FROM recruiter_notes WHERE resume_id = ?').get(resumeId);
  if (existing) {
    db.prepare('UPDATE recruiter_notes SET note_text = ?, updated_at = CURRENT_TIMESTAMP WHERE resume_id = ?').run(noteText, resumeId);
  } else {
    db.prepare('INSERT INTO recruiter_notes (id, resume_id, note_text) VALUES (?, ?, ?)').run(uuid(), resumeId, noteText);
  }

  return res.json({ resumeId, noteText });
});

module.exports = router;
