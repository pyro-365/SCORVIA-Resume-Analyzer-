'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db/connection');
const engine = require('@resume-screening/engine');

const {
  sectionDetector,
  phraseMatcher,
  negativeContextDetector,
  experienceExtractor,
  educationExtractor,
  scoringEngine,
  rankingEngine,
  reportGenerator,
  skillDictionary,
} = engine;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are supported in Version 1.'));
    }
  },
});

function uuid() {
  return crypto.randomUUID();
}

// POST /api/runs — Create screening run for a JD
router.post('/', (req, res) => {
  const { jdId, mandatoryWeight = 0.5, preferredWeight = 0.25, experienceWeight = 0.15, educationWeight = 0.1 } = req.body;

  if (!jdId) {
    return res.status(400).json({ error: 'jdId is required to create a screening run.' });
  }

  const jd = db.prepare('SELECT id FROM job_descriptions WHERE id = ?').get(jdId);
  if (!jd) {
    return res.status(404).json({ error: `Job Description '${jdId}' not found.` });
  }

  const runId = uuid();
  db.prepare(`
    INSERT INTO screening_runs (id, jd_id, status, mandatory_weight, preferred_weight, experience_weight, education_weight)
    VALUES (?, ?, 'draft', ?, ?, ?, ?)
  `).run(runId, jdId, mandatoryWeight, preferredWeight, experienceWeight, educationWeight);

  return res.status(201).json({
    id: runId,
    jdId,
    status: 'draft',
    weights: {
      mandatory: mandatoryWeight,
      preferred: preferredWeight,
      experience: experienceWeight,
      education: educationWeight,
    },
  });
});

// GET /api/runs/:id — Get run details + uploaded resumes
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(id);

  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  const jd = db.prepare('SELECT * FROM job_descriptions WHERE id = ?').get(run.jd_id);
  const resumes = db.prepare('SELECT id, file_name, detected_experience_years, detected_education, created_at FROM resumes WHERE run_id = ?').all(id);

  return res.json({
    id: run.id,
    jdId: run.jd_id,
    jdTitle: jd ? jd.title : 'Unknown',
    status: run.status,
    weights: {
      mandatory: run.mandatory_weight,
      preferred: run.preferred_weight,
      experience: run.experience_weight,
      education: run.education_weight,
    },
    resumesCount: resumes.length,
    resumes,
    createdAt: run.created_at,
  });
});

// POST /api/runs/:id/resumes — Upload resume file(s) or paste rawText
router.post('/:id/resumes', upload.array('files'), (req, res) => {
  const { id: runId } = req.params;
  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(runId);

  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  const addedResumes = [];
  const insertResume = db.prepare(`
    INSERT INTO resumes (id, run_id, file_name, raw_text, detected_experience_years, detected_education)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertSections = db.prepare(`
    INSERT INTO resume_sections (id, resume_id, summary_text, skills_text, experience_text, education_text, projects_text, certifications_text, other_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const processResume = (fileName, rawText) => {
    const resumeId = uuid();
    const sections = sectionDetector.splitIntoSections(rawText);
    const expYears = experienceExtractor.extractYearsOfExperience(sections.experience || rawText);
    const eduLevel = educationExtractor.extractEducationLevel(sections.education || rawText);

    insertResume.run(resumeId, runId, fileName, rawText, expYears, eduLevel);
    insertSections.run(
      uuid(),
      resumeId,
      sections.summary || '',
      sections.skills || '',
      sections.experience || '',
      sections.education || '',
      sections.projects || '',
      sections.certifications || '',
      sections.other || ''
    );

    addedResumes.push({
      id: resumeId,
      fileName,
      detectedExperienceYears: expYears,
      detectedEducation: eduLevel,
    });
  };

  const transaction = db.transaction(() => {
    // 1. Files uploaded via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const text = file.buffer.toString('utf-8');
        processResume(file.originalname, text);
      }
    }

    // 2. Text pasted directly via JSON body (resumes: [{ fileName, rawText }])
    if (req.body.resumes) {
      let pasteList = req.body.resumes;
      if (typeof pasteList === 'string') {
        try { pasteList = JSON.parse(pasteList); } catch (e) { pasteList = []; }
      }
      if (Array.isArray(pasteList)) {
        for (const item of pasteList) {
          if (item.rawText) {
            processResume(item.fileName || `resume_${addedResumes.length + 1}.txt`, item.rawText);
          }
        }
      }
    } else if (req.body.rawText) {
      processResume(req.body.fileName || 'pasted_resume.txt', req.body.rawText);
    }
  });

  try {
    transaction();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (addedResumes.length === 0) {
    return res.status(400).json({ error: 'No valid .txt resumes provided.' });
  }

  return res.status(201).json({
    runId,
    uploadedCount: addedResumes.length,
    resumes: addedResumes,
  });
});

// DELETE /api/runs/:id/resumes/:resumeId
router.delete('/:id/resumes/:resumeId', (req, res) => {
  const { id: runId, resumeId } = req.params;
  const deleted = db.prepare('DELETE FROM resumes WHERE id = ? AND run_id = ?').run(resumeId, runId);

  if (deleted.changes === 0) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  return res.json({ message: 'Resume deleted.' });
});

// POST /api/runs/:id/execute — Execute full engine matching pipeline
router.post('/:id/execute', (req, res) => {
  const { id: runId } = req.params;
  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(runId);

  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  const jd = db.prepare('SELECT * FROM job_descriptions WHERE id = ?').get(run.jd_id);
  const reqs = db.prepare('SELECT * FROM jd_requirements WHERE jd_id = ?').all(run.jd_id);
  const resumes = db.prepare('SELECT * FROM resumes WHERE run_id = ?').all(runId);

  if (resumes.length === 0) {
    return res.status(400).json({ error: 'Cannot execute screening: No resumes uploaded for this run.' });
  }

  // Construct JD Model
  const mandatorySkills = reqs.filter((r) => r.category === 'mandatory' && r.skill_name).map((r) => r.skill_name);
  const preferredSkills = reqs.filter((r) => r.category === 'preferred' && r.skill_name).map((r) => r.skill_name);
  const minExp = reqs.length > 0 ? Math.max(...reqs.map((r) => r.min_experience_years || 0)) : 0;
  const minEdu = reqs.find((r) => r.min_education)?.min_education || '';

  const jdModel = {
    mandatorySkills,
    preferredSkills,
    minExperienceYears: minExp,
    minEducation: minEdu,
  };

  const weights = {
    mandatory: run.mandatory_weight,
    preferred: run.preferred_weight,
    experience: run.experience_weight,
    education: run.education_weight,
  };

  const allVariants = skillDictionary.getAllVariants();
  const getCanonical = skillDictionary.getCanonicalSkill.bind(skillDictionary);

  // 1. Process and score each resume
  const unrankedResults = resumes.map((resume) => {
    const rawSkills = phraseMatcher.findCanonicalSkills(resume.raw_text, allVariants, getCanonical);
    const { confirmed: detectedSkills, negated: negatedSkills } =
      negativeContextDetector.filterNegatedSkills(rawSkills, resume.raw_text);

    const resumeModel = {
      fileName: resume.file_name,
      rawText: resume.raw_text,
      detectedSkills,
      negatedSkills,
      detectedExperienceYears: resume.detected_experience_years,
      detectedEducation: resume.detected_education,
    };

    const scores = scoringEngine.calculateScores(jdModel, resumeModel, weights);
    const report = reportGenerator.generateReport(scores);

    return {
      resumeId: resume.id,
      fileName: resume.file_name,
      scores,
      report,
    };
  });

  // 2. Rank candidates using rankingEngine
  const scoreObjectsForRanking = unrankedResults.map((u) => ({ ...u.scores, resumeId: u.resumeId, report: u.report }));
  const ranked = rankingEngine.rankCandidates(scoreObjectsForRanking);

  // 3. Clear old results for this run & persist new ones in a transaction
  const deleteOldScores = db.prepare('DELETE FROM score_results WHERE run_id = ?').run.bind(db.prepare('DELETE FROM score_results WHERE run_id = ?'), runId);

  const insertScore = db.prepare(`
    INSERT INTO score_results (id, run_id, resume_id, final_score, mandatory_score, preferred_score, experience_score, education_score, penalty_applied, rank, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMatched = db.prepare(`
    INSERT INTO matched_skills (id, score_id, skill_name, is_mandatory) VALUES (?, ?, ?, ?)
  `);

  const insertMissing = db.prepare(`
    INSERT INTO missing_skills (id, score_id, skill_name, is_mandatory) VALUES (?, ?, ?, ?)
  `);

  const insertExplanation = db.prepare(`
    INSERT INTO explanations (id, score_id, line_index, explanation_text) VALUES (?, ?, ?, ?)
  `);

  const updateRunStatus = db.prepare(`
    UPDATE screening_runs SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    deleteOldScores();

    for (const r of ranked) {
      const scoreId = uuid();
      const rec = r.report.recommendation;

      insertScore.run(
        scoreId,
        runId,
        r.resumeId,
        r.finalScore,
        r.mandatorySkillScore,
        r.preferredSkillScore,
        r.experienceScore,
        r.educationScore,
        r.penaltyApplied || 0,
        r.rank,
        rec
      );

      for (const s of r.matchedMandatory || []) {
        insertMatched.run(uuid(), scoreId, s, 1);
      }
      for (const s of r.matchedPreferred || []) {
        insertMatched.run(uuid(), scoreId, s, 0);
      }
      for (const s of r.missingMandatory || []) {
        insertMissing.run(uuid(), scoreId, s, 1);
      }
      for (const s of r.missingPreferred || []) {
        insertMissing.run(uuid(), scoreId, s, 0);
      }

      if (r.report && r.report.explanation) {
        r.report.explanation.forEach((line, idx) => {
          insertExplanation.run(uuid(), scoreId, idx, line);
        });
      }
    }

    updateRunStatus.run(runId);
  });

  transaction();

  return res.json({
    runId,
    status: 'completed',
    processedCount: ranked.length,
    rankings: ranked.map((r) => ({
      rank: r.rank,
      resumeId: r.resumeId,
      fileName: r.fileName,
      finalScore: r.finalScore,
      recommendation: r.report.recommendation,
    })),
  });
});

// PUT /api/runs/:id/weights — Update weights & optionally re-execute
router.put('/:id/weights', (req, res) => {
  const { id: runId } = req.params;
  const { mandatory = 0.5, preferred = 0.25, experience = 0.15, education = 0.1, reexecute = true } = req.body;

  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(runId);
  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  db.prepare(`
    UPDATE screening_runs
    SET mandatory_weight = ?, preferred_weight = ?, experience_weight = ?, education_weight = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(mandatory, preferred, experience, education, runId);

  if (reexecute && run.status === 'completed') {
    // Re-trigger execution
    return router.handle({ method: 'POST', url: `/${runId}/execute`, params: { id: runId } }, res);
  }

  return res.json({
    runId,
    weights: { mandatory, preferred, experience, education },
  });
});

module.exports = router;
