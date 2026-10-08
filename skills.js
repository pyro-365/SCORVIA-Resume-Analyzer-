'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');
const engine = require('@resume-screening/engine');
const { skillDictionary } = engine;

function uuid() {
  return crypto.randomUUID();
}

// GET /api/skills — List all skills + variants
router.get('/', (_req, res) => {
  const skills = db.prepare('SELECT * FROM skill_dictionary ORDER BY canonical_name ASC').all();
  const variants = db.prepare('SELECT * FROM skill_variants').all();

  const variantMap = new Map();
  for (const v of variants) {
    if (!variantMap.has(v.skill_id)) variantMap.set(v.skill_id, []);
    variantMap.get(v.skill_id).push(v.variant_text);
  }

  const result = skills.map((s) => ({
    id: s.id,
    canonicalName: s.canonical_name,
    category: s.category,
    variants: variantMap.get(s.id) || [s.canonical_name],
  }));

  return res.json(result);
});

// GET /api/skills/export — JSON export
router.get('/export', (_req, res) => {
  const skills = db.prepare('SELECT * FROM skill_dictionary').all();
  const variants = db.prepare('SELECT * FROM skill_variants').all();

  const dictionaryExport = {};
  for (const s of skills) {
    const sVariants = variants.filter((v) => v.skill_id === s.id).map((v) => v.variant_text);
    dictionaryExport[s.canonical_name] = {
      category: s.category,
      variants: sVariants.length > 0 ? sVariants : [s.canonical_name],
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=skill_dictionary.json');
  return res.json(dictionaryExport);
});

// POST /api/skills/import — JSON import
router.post('/import', (req, res) => {
  const dictionary = req.body;
  if (!dictionary || typeof dictionary !== 'object') {
    return res.status(400).json({ error: 'Invalid dictionary JSON format.' });
  }

  const insertSkill = db.prepare(`
    INSERT INTO skill_dictionary (id, canonical_name, category)
    VALUES (?, ?, ?)
    ON CONFLICT(canonical_name) DO UPDATE SET category = excluded.category
  `);

  const insertVariant = db.prepare(`
    INSERT OR IGNORE INTO skill_variants (id, skill_id, variant_text)
    VALUES (?, ?, ?)
  `);

  const getSkill = db.prepare('SELECT id FROM skill_dictionary WHERE canonical_name = ?');

  const transaction = db.transaction(() => {
    for (const [canonical, data] of Object.entries(dictionary)) {
      const cat = data.category || 'general';
      const existing = getSkill.get(canonical);
      let skillId = existing ? existing.id : uuid();

      insertSkill.run(skillId, canonical, cat);

      // Also register in engine runtime dictionary
      skillDictionary.addSkill(canonical, cat, data.variants || [canonical]);

      if (data.variants && Array.isArray(data.variants)) {
        for (const v of data.variants) {
          insertVariant.run(uuid(), skillId, v.toLowerCase());
        }
      }
    }
  });

  transaction();
  return res.json({ message: 'Skill dictionary imported successfully.', count: Object.keys(dictionary).length });
});

// POST /api/skills — Add a single skill
router.post('/', (req, res) => {
  const { canonicalName, category = 'programming', variants = [] } = req.body;

  if (!canonicalName || typeof canonicalName !== 'string' || !canonicalName.trim()) {
    return res.status(400).json({ error: 'canonicalName is required.' });
  }

  const cleanName = canonicalName.toLowerCase().trim();
  const existing = db.prepare('SELECT id FROM skill_dictionary WHERE canonical_name = ?').get(cleanName);
  if (existing) {
    return res.status(409).json({ error: `Skill '${cleanName}' already exists.` });
  }

  const skillId = uuid();
  const allVariants = [...new Set([cleanName, ...variants.map((v) => v.toLowerCase().trim())])];

  const insertSkill = db.prepare(`
    INSERT INTO skill_dictionary (id, canonical_name, category) VALUES (?, ?, ?)
  `);
  const insertVariant = db.prepare(`
    INSERT INTO skill_variants (id, skill_id, variant_text) VALUES (?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertSkill.run(skillId, cleanName, category);
    for (const v of allVariants) {
      insertVariant.run(uuid(), skillId, v);
    }
  });

  transaction();

  // Sync to runtime engine
  skillDictionary.addSkill(cleanName, category, allVariants);

  return res.status(201).json({
    id: skillId,
    canonicalName: cleanName,
    category,
    variants: allVariants,
  });
});

// DELETE /api/skills/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM skill_dictionary WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Skill not found.' });
  }

  db.prepare('DELETE FROM skill_dictionary WHERE id = ?').run(id);
  return res.json({ message: `Skill '${existing.canonical_name}' deleted.` });
});

module.exports = router;
