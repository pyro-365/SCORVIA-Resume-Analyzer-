'use strict';

const db = require('./connection');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_descriptions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jd_requirements (
      id TEXT PRIMARY KEY,
      jd_id TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('mandatory', 'preferred', 'general')),
      skill_name TEXT,
      min_experience_years INTEGER DEFAULT 0,
      min_education TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skill_dictionary (
      id TEXT PRIMARY KEY,
      canonical_name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skill_variants (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      variant_text TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (skill_id) REFERENCES skill_dictionary(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS screening_runs (
      id TEXT PRIMARY KEY,
      jd_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'processing', 'completed')),
      mandatory_weight REAL DEFAULT 0.50,
      preferred_weight REAL DEFAULT 0.25,
      experience_weight REAL DEFAULT 0.15,
      education_weight REAL DEFAULT 0.10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      detected_experience_years INTEGER DEFAULT 0,
      detected_education TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES screening_runs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS resume_sections (
      id TEXT PRIMARY KEY,
      resume_id TEXT UNIQUE NOT NULL,
      summary_text TEXT DEFAULT '',
      skills_text TEXT DEFAULT '',
      experience_text TEXT DEFAULT '',
      education_text TEXT DEFAULT '',
      projects_text TEXT DEFAULT '',
      certifications_text TEXT DEFAULT '',
      other_text TEXT DEFAULT '',
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS score_results (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      resume_id TEXT NOT NULL,
      final_score INTEGER NOT NULL,
      mandatory_score INTEGER NOT NULL,
      preferred_score INTEGER NOT NULL,
      experience_score INTEGER NOT NULL,
      education_score INTEGER NOT NULL,
      penalty_applied INTEGER DEFAULT 0,
      rank INTEGER NOT NULL,
      recommendation TEXT NOT NULL CHECK(recommendation IN ('Suitable', 'Partially suitable', 'Not suitable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES screening_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matched_skills (
      id TEXT PRIMARY KEY,
      score_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL, -- 1 for mandatory, 0 for preferred
      FOREIGN KEY (score_id) REFERENCES score_results(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS missing_skills (
      id TEXT PRIMARY KEY,
      score_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL,
      FOREIGN KEY (score_id) REFERENCES score_results(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS explanations (
      id TEXT PRIMARY KEY,
      score_id TEXT NOT NULL,
      line_index INTEGER NOT NULL,
      explanation_text TEXT NOT NULL,
      FOREIGN KEY (score_id) REFERENCES score_results(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS manual_labels (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      resume_id TEXT NOT NULL,
      label TEXT NOT NULL CHECK(label IN ('suitable', 'partially suitable', 'unsuitable')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES screening_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
      UNIQUE(run_id, resume_id)
    );

    CREATE TABLE IF NOT EXISTS evaluation_metrics (
      id TEXT PRIMARY KEY,
      run_id TEXT UNIQUE NOT NULL,
      total_resumes INTEGER NOT NULL,
      precision_val REAL NOT NULL,
      recall_val REAL NOT NULL,
      f1_val REAL NOT NULL,
      accuracy_val REAL NOT NULL,
      calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (run_id) REFERENCES screening_runs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recruiter_notes (
      id TEXT PRIMARY KEY,
      resume_id TEXT UNIQUE NOT NULL,
      note_text TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );

    -- INDEXES
    CREATE INDEX IF NOT EXISTS idx_jd_requirements_jd_id ON jd_requirements(jd_id);
    CREATE INDEX IF NOT EXISTS idx_skill_variants_skill_id ON skill_variants(skill_id);
    CREATE INDEX IF NOT EXISTS idx_screening_runs_jd_id ON screening_runs(jd_id);
    CREATE INDEX IF NOT EXISTS idx_resumes_run_id ON resumes(run_id);
    CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON resume_sections(resume_id);
    CREATE INDEX IF NOT EXISTS idx_score_results_run_id ON score_results(run_id);
    CREATE INDEX IF NOT EXISTS idx_score_results_resume_id ON score_results(resume_id);
    CREATE INDEX IF NOT EXISTS idx_matched_skills_score_id ON matched_skills(score_id);
    CREATE INDEX IF NOT EXISTS idx_missing_skills_score_id ON missing_skills(score_id);
    CREATE INDEX IF NOT EXISTS idx_explanations_score_id ON explanations(score_id);
    CREATE INDEX IF NOT EXISTS idx_manual_labels_run_resume ON manual_labels(run_id, resume_id);
  `);
}

module.exports = { initSchema };
