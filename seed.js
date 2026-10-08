'use strict';

const crypto = require('crypto');
const db = require('./connection');
const { initSchema } = require('./schema');
const engine = require('@resume-screening/engine');
const { DEFAULT_SKILL_DICTIONARY } = engine.skillDictionary;

function uuid() {
  return crypto.randomUUID();
}

function seed() {
  initSchema();

  // Seed default user if not exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@screener.local');
  if (!existingUser) {
    db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)').run(
      uuid(),
      'admin@screener.local',
      'Default Recruiter'
    );
  }

  // Seed default skill dictionary
  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO skill_dictionary (id, canonical_name, category)
    VALUES (?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT OR IGNORE INTO skill_variants (id, skill_id, variant_text)
    VALUES (?, ?, ?)
  `);

  const getSkillId = db.prepare('SELECT id FROM skill_dictionary WHERE canonical_name = ?');

  const seedTransaction = db.transaction(() => {
    for (const [canonical, data] of Object.entries(DEFAULT_SKILL_DICTIONARY)) {
      let row = getSkillId.get(canonical);
      let skillId;
      if (!row) {
        skillId = uuid();
        insertSkill.run(skillId, canonical, data.category);
      } else {
        skillId = row.id;
      }

      if (data.variants && Array.isArray(data.variants)) {
        for (const variant of data.variants) {
          insertVariant.run(uuid(), skillId, variant.toLowerCase());
        }
      }
    }
  });

  seedTransaction();
  console.log(`[DB SEED] Database seeded successfully. Skills count: ${Object.keys(DEFAULT_SKILL_DICTIONARY).length}`);
}

function resetDb() {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS recruiter_notes;
    DROP TABLE IF EXISTS evaluation_metrics;
    DROP TABLE IF EXISTS manual_labels;
    DROP TABLE IF EXISTS explanations;
    DROP TABLE IF EXISTS missing_skills;
    DROP TABLE IF EXISTS matched_skills;
    DROP TABLE IF EXISTS score_results;
    DROP TABLE IF EXISTS resume_sections;
    DROP TABLE IF EXISTS resumes;
    DROP TABLE IF EXISTS screening_runs;
    DROP TABLE IF EXISTS skill_variants;
    DROP TABLE IF EXISTS skill_dictionary;
    DROP TABLE IF EXISTS jd_requirements;
    DROP TABLE IF EXISTS job_descriptions;
    DROP TABLE IF EXISTS users;
    PRAGMA foreign_keys = ON;
  `);
  seed();
}

if (require.main === module) {
  if (process.argv.includes('--reset')) {
    resetDb();
  } else {
    seed();
  }
}

module.exports = { seed, resetDb };
