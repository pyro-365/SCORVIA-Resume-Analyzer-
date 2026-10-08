'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');

function uuid() {
  return crypto.randomUUID();
}

// POST /api/runs/:id/labels — Submit/update manual label for a resume
router.post('/runs/:id/labels', (req, res) => {
  const { id: runId } = req.params;
  const { resumeId, label } = req.body;

  if (!resumeId || !label) {
    return res.status(400).json({ error: 'resumeId and label are required.' });
  }

  const validLabels = ['suitable', 'partially suitable', 'unsuitable'];
  const normLabel = label.toLowerCase().trim();
  if (!validLabels.includes(normLabel)) {
    return res.status(400).json({ error: `Invalid label. Must be one of: ${validLabels.join(', ')}` });
  }

  const resume = db.prepare('SELECT id FROM resumes WHERE id = ? AND run_id = ?').get(resumeId, runId);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found in this screening run.' });
  }

  const existing = db.prepare('SELECT id FROM manual_labels WHERE run_id = ? AND resume_id = ?').get(runId, resumeId);
  if (existing) {
    db.prepare('UPDATE manual_labels SET label = ? WHERE id = ?').run(normLabel, existing.id);
  } else {
    db.prepare('INSERT INTO manual_labels (id, run_id, resume_id, label) VALUES (?, ?, ?, ?)').run(uuid(), runId, resumeId, normLabel);
  }

  return res.json({ runId, resumeId, label: normLabel });
});

// GET /api/runs/:id/evaluation — Compute Precision, Recall, F1 against manual labels
router.get('/runs/:id/evaluation', (req, res) => {
  const { id: runId } = req.params;

  const run = db.prepare('SELECT * FROM screening_runs WHERE id = ?').get(runId);
  if (!run) {
    return res.status(404).json({ error: 'Screening run not found.' });
  }

  const items = db.prepare(`
    SELECT sr.recommendation, ml.label as ground_truth
    FROM score_results sr
    JOIN manual_labels ml ON sr.run_id = ml.run_id AND sr.resume_id = ml.resume_id
    WHERE sr.run_id = ?
  `).all(runId);

  const totalLabeled = items.length;
  const totalResumes = db.prepare('SELECT COUNT(*) as cnt FROM resumes WHERE run_id = ?').get(runId).cnt;

  if (totalLabeled === 0) {
    return res.json({
      runId,
      totalResumes,
      totalLabeled: 0,
      metrics: {
        precision: 0,
        recall: 0,
        f1: 0,
        accuracy: 0,
      },
      confusionMatrix: { tp: 0, fp: 0, fn: 0, tn: 0 },
      message: 'No manual ground-truth labels provided yet for this run.',
    });
  }

  // Treat 'Suitable' (system) & 'suitable' (label) as Positive class
  // 'Partially suitable' treated as Partial (or Positive in relaxed evaluation)
  let tp = 0; // True Positive: System Suitable & Label Suitable
  let fp = 0; // False Positive: System Suitable & Label Unsuitable
  let fn = 0; // False Negative: System Unsuitable & Label Suitable
  let tn = 0; // True Negative: System Unsuitable & Label Unsuitable

  for (const item of items) {
    const sys = item.recommendation.toLowerCase();
    const gt = item.ground_truth.toLowerCase();

    const isSysPos = sys === 'suitable' || sys === 'partially suitable';
    const isGtPos = gt === 'suitable' || gt === 'partially suitable';

    if (isSysPos && isGtPos) tp++;
    else if (isSysPos && !isGtPos) fp++;
    else if (!isSysPos && isGtPos) fn++;
    else tn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = totalLabeled > 0 ? (tp + tn) / totalLabeled : 0;

  // Persist evaluation metrics in DB
  const metricId = uuid();
  db.prepare(`
    INSERT INTO evaluation_metrics (id, run_id, total_resumes, precision_val, recall_val, f1_val, accuracy_val)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(run_id) DO UPDATE SET
      total_resumes = excluded.total_resumes,
      precision_val = excluded.precision_val,
      recall_val = excluded.recall_val,
      f1_val = excluded.f1_val,
      accuracy_val = excluded.accuracy_val,
      calculated_at = CURRENT_TIMESTAMP
  `).run(metricId, runId, totalResumes, precision, recall, f1, accuracy);

  return res.json({
    runId,
    totalResumes,
    totalLabeled,
    metrics: {
      precision: Math.round(precision * 1000) / 10, // percentage e.g. 85.5%
      recall: Math.round(recall * 1000) / 10,
      f1: Math.round(f1 * 1000) / 10,
      accuracy: Math.round(accuracy * 1000) / 10,
    },
    confusionMatrix: { tp, fp, fn, tn },
  });
});

module.exports = router;
