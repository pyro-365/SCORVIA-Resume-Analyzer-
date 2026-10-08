'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');
const engine = require('@resume-screening/engine');
const { requirementClassifier } = engine;

function uuid() {
  return crypto.randomUUID();
}

// POST /api/job-descriptions — Create & parse JD
router.post('/', (req, res) => {
  const { title = 'Untitled Position', rawText } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Job description text (rawText) is required.' });
  }

  const parsed = requirementClassifier.classifyJD(rawText);
  const jdId = uuid();

  const insertJd = db.prepare(`
    INSERT INTO job_descriptions (id, title, raw_text)
    VALUES (?, ?, ?)
  `);

  const insertReq = db.prepare(`
    INSERT INTO jd_requirements (id, jd_id, category, skill_name, min_experience_years, min_education)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertJd.run(jdId, title, rawText);

    // Save mandatory skills
    for (const skill of parsed.mandatorySkills) {
      insertReq.run(uuid(), jdId, 'mandatory', skill, parsed.minExperienceYears, parsed.minEducation);
    }

    // Save preferred skills
    for (const skill of parsed.preferredSkills) {
      insertReq.run(uuid(), jdId, 'preferred', skill, parsed.minExperienceYears, parsed.minEducation);
    }

    // Save general requirements if no skills
    if (parsed.mandatorySkills.length === 0 && parsed.preferredSkills.length === 0) {
      insertReq.run(uuid(), jdId, 'general', null, parsed.minExperienceYears, parsed.minEducation);
    }
  });

  transaction();

  return res.status(201).json({
    id: jdId,
    title,
    rawText,
    parsedRequirements: parsed,
  });
});

// GET /api/job-descriptions/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const jd = db.prepare('SELECT * FROM job_descriptions WHERE id = ?').get(id);
  if (!jd) {
    return res.status(404).json({ error: 'Job description not found.' });
  }

  const reqs = db.prepare('SELECT * FROM jd_requirements WHERE jd_id = ?').all(id);

  const mandatorySkills = reqs.filter((r) => r.category === 'mandatory' && r.skill_name).map((r) => r.skill_name);
  const preferredSkills = reqs.filter((r) => r.category === 'preferred' && r.skill_name).map((r) => r.skill_name);
  const minExp = reqs.length > 0 ? Math.max(...reqs.map((r) => r.min_experience_years || 0)) : 0;
  const minEdu = reqs.find((r) => r.min_education)?.min_education || '';

  return res.json({
    id: jd.id,
    title: jd.title,
    rawText: jd.raw_text,
    createdAt: jd.created_at,
    parsedRequirements: {
      mandatorySkills,
      preferredSkills,
      minExperienceYears: minExp,
      minEducation: minEdu,
    },
  });
});

// PUT /api/job-descriptions/:id — Update title/rawText or manually override skills
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, rawText, mandatorySkills, preferredSkills, minExperienceYears, minEducation } = req.body;

  const existing = db.prepare('SELECT * FROM job_descriptions WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Job description not found.' });
  }

  const newTitle = title || existing.title;
  const newRawText = rawText || existing.raw_text;

  let parsed = {
    mandatorySkills: mandatorySkills || [],
    preferredSkills: preferredSkills || [],
    minExperienceYears: minExperienceYears !== undefined ? minExperienceYears : 0,
    minEducation: minEducation || '',
  };

  if (rawText && (!mandatorySkills || !preferredSkills)) {
    parsed = requirementClassifier.classifyJD(newRawText);
    if (mandatorySkills) parsed.mandatorySkills = mandatorySkills;
    if (preferredSkills) parsed.preferredSkills = preferredSkills;
  }

  const updateJd = db.prepare(`
    UPDATE job_descriptions SET title = ?, raw_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);

  const deleteReqs = db.prepare('DELETE FROM jd_requirements WHERE jd_id = ?');
  const insertReq = db.prepare(`
    INSERT INTO jd_requirements (id, jd_id, category, skill_name, min_experience_years, min_education)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    updateJd.run(newTitle, newRawText, id);
    deleteReqs.run(id);

    for (const skill of parsed.mandatorySkills) {
      insertReq.run(uuid(), id, 'mandatory', skill, parsed.minExperienceYears, parsed.minEducation);
    }
    for (const skill of parsed.preferredSkills) {
      insertReq.run(uuid(), id, 'preferred', skill, parsed.minExperienceYears, parsed.minEducation);
    }
  });

  transaction();

  return res.json({
    id,
    title: newTitle,
    rawText: newRawText,
    parsedRequirements: parsed,
  });
});

module.exports = router;
