'use strict';

/**
 * sectionDetector.js
 * Splits resume text into named sections using heading synonym matching.
 */

const SECTION_HEADINGS = {
  summary: [
    'summary', 'professional summary', 'objective', 'profile',
    'career objective', 'about me', 'overview', 'professional profile',
  ],
  skills: [
    'skills', 'technical skills', 'core competencies', 'competencies',
    'technologies', 'tech stack', 'tools', 'languages', 'expertise',
    'key skills', 'technical expertise', 'programming languages',
  ],
  experience: [
    'experience', 'work experience', 'professional experience',
    'employment history', 'career history', 'work history',
    'positions held', 'relevant experience',
  ],
  education: [
    'education', 'educational background', 'academic background',
    'qualifications', 'academic qualifications', 'degrees',
  ],
  projects: [
    'projects', 'project experience', 'personal projects', 'key projects',
    'relevant projects', 'side projects', 'portfolio',
  ],
  certifications: [
    'certifications', 'certificates', 'credentials',
    'licenses', 'awards & certifications', 'professional certifications',
  ],
  achievements: [
    'achievements', 'accomplishments', 'honors', 'awards',
  ],
};

/**
 * Detect which section name a heading line belongs to.
 * @param {string} line
 * @returns {string|null} section key or null
 */
function detectSectionHeading(line) {
  const clean = line.toLowerCase().replace(/[^a-z\s&]/g, '').trim();
  for (const [section, headings] of Object.entries(SECTION_HEADINGS)) {
    if (headings.some((h) => clean === h || clean.startsWith(h))) {
      return section;
    }
  }
  return null;
}

/**
 * Check if a line looks like a heading (short, no trailing period, not a sentence).
 * @param {string} line
 * @returns {boolean}
 */
function isHeadingLike(line) {
  const trimmed = line.trim();
  // Headings: short (< 60 chars), no period at end, not starting with bullet
  if (trimmed.length > 60) return false;
  if (trimmed.endsWith('.') || trimmed.endsWith(',')) return false;
  if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) return false;
  // Must have no more than 6 words
  if (trimmed.split(/\s+/).length > 6) return false;
  return true;
}

/**
 * Split resume text into named sections.
 * Returns an object with section names as keys and text content as values.
 * @param {string} resumeText
 * @returns {{summary: string, skills: string, experience: string, education: string, projects: string, certifications: string, achievements: string, other: string}}
 */
function splitIntoSections(resumeText) {
  const sections = {
    summary: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
    certifications: '',
    achievements: '',
    other: '',
  };

  if (!resumeText || typeof resumeText !== 'string') return sections;

  const lines = resumeText.split('\n');
  let currentSection = 'other';
  const sectionBuffer = { other: [] };

  for (const section of Object.keys(sections)) {
    sectionBuffer[section] = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      sectionBuffer[currentSection].push('');
      continue;
    }

    if (isHeadingLike(trimmed)) {
      const detected = detectSectionHeading(trimmed);
      if (detected) {
        currentSection = detected;
        continue; // skip the heading line itself
      }
    }

    sectionBuffer[currentSection].push(trimmed);
  }

  for (const [section, lines] of Object.entries(sectionBuffer)) {
    sections[section] = lines.join('\n').trim();
  }

  return sections;
}

module.exports = {
  splitIntoSections,
  detectSectionHeading,
  isHeadingLike,
  SECTION_HEADINGS,
};
