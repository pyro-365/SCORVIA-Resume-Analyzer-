'use strict';

/**
 * requirementClassifier.js
 * Classifies job description text into mandatory, preferred, and general
 * requirements, and extracts minimum experience/education.
 */

const { getCanonicalSkill, getAllVariants } = require('./skillDictionary');

const MANDATORY_CUES = [
  'must have', 'must-have', 'required', 'requirements', 'mandatory',
  'essential', 'minimum', 'necessary', 'you will need', 'must possess',
  'should possess', 'key requirements', 'core requirements',
  'qualifications required', 'basic qualifications',
];

const PREFERRED_CUES = [
  'preferred', 'desirable', 'nice to have', 'nice-to-have', 'bonus',
  'advantage', 'asset', 'beneficial', 'ideally', 'good to have',
  'not required but', 'optional', 'plus',
];

// Experience patterns — allow up to 2 qualifier words between 'years' and 'experience'
const EXP_PATTERNS = [
  /(\d+)\+?\s*(?:-\s*\d+\+?)?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:\w+\s+){0,2})?(?:experience|exp(?:erience)?)/gi,
  /minimum\s+(\d+)\s*(?:years?|yrs?)/gi,
  /at\s+least\s+(\d+)\s*(?:years?|yrs?)/gi,
  /over\s+(\d+)\s*(?:years?|yrs?)/gi,
];

// Education keywords mapped to levels
const EDUCATION_LEVELS = [
  { keywords: ['phd', 'ph.d', 'doctorate', 'doctoral'], level: 'phd' },
  { keywords: ['master', 'masters', 'm.s', 'msc', 'mba', 'm.tech', 'mtech', 'me '], level: 'masters' },
  { keywords: ['bachelor', 'bachelors', 'b.s', 'bsc', 'b.tech', 'btech', 'be ', 'undergraduate', 'degree'], level: 'bachelors' },
  { keywords: ['diploma', 'associate', 'a.s'], level: 'diploma' },
  { keywords: ['high school', 'secondary'], level: 'highschool' },
];

/**
 * Split JD text into sentences/clauses for classification.
 * @param {string} text
 * @returns {string[]}
 */
function splitIntoLines(text) {
  return text
    .split(/[\n;]/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Check if a line is dominated by a mandatory or preferred cue.
 * @param {string} line
 * @returns {'mandatory'|'preferred'|'general'}
 */
function classifyLine(line) {
  const lower = line.toLowerCase();
  if (MANDATORY_CUES.some((cue) => lower.includes(cue))) return 'mandatory';
  if (PREFERRED_CUES.some((cue) => lower.includes(cue))) return 'preferred';
  return 'general';
}

/**
 * Extract all skill mentions from a line of text.
 * @param {string} line
 * @returns {string[]} canonical skill names
 */
function extractSkillsFromLine(line) {
  const lower = line.toLowerCase();
  const found = new Set();

  // Check multi-word variants first (longest match wins)
  const variants = getAllVariants().sort((a, b) => b.length - a.length);
  for (const variant of variants) {
    if (lower.includes(variant.toLowerCase())) {
      const canonical = getCanonicalSkill(variant);
      if (canonical) found.add(canonical);
    }
  }
  return [...found];
}

/**
 * Extract minimum years of experience from text.
 * @param {string} text
 * @returns {number} years (0 if not found)
 */
function extractMinExperience(text) {
  let max = 0;
  for (const pattern of EXP_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years > max) max = years;
    }
  }
  return max;
}

/**
 * Extract minimum education level from text.
 * @param {string} text
 * @returns {string} education level string, or '' if not found
 */
function extractMinEducation(text) {
  const lower = text.toLowerCase();
  for (const { keywords, level } of EDUCATION_LEVELS) {
    if (keywords.some((kw) => lower.includes(kw))) return level;
  }
  return '';
}

/**
 * Main classification function.
 * @param {string} jdText
 * @returns {{ mandatorySkills: string[], preferredSkills: string[], generalRequirements: string[], minExperienceYears: number, minEducation: string }}
 */
function classifyJD(jdText) {
  if (!jdText || typeof jdText !== 'string') {
    return { mandatorySkills: [], preferredSkills: [], generalRequirements: [], minExperienceYears: 0, minEducation: '' };
  }

  const lines = splitIntoLines(jdText);
  const mandatory = new Set();
  const preferred = new Set();
  const general = new Set();

  // Detect section-level context (heading changes classification of subsequent lines)
  let currentContext = 'general';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detect heading-level context change
    if (MANDATORY_CUES.some((cue) => lower.includes(cue))) currentContext = 'mandatory';
    else if (PREFERRED_CUES.some((cue) => lower.includes(cue))) currentContext = 'preferred';

    const lineClass = classifyLine(line);
    const skills = extractSkillsFromLine(line);
    const effectiveClass = lineClass !== 'general' ? lineClass : currentContext;

    for (const skill of skills) {
      if (effectiveClass === 'mandatory') mandatory.add(skill);
      else if (effectiveClass === 'preferred') preferred.add(skill);
      else general.add(skill);
    }

    // General lines get added as raw text too
    if (skills.length === 0 && line.length > 5) general.add(line);
  }

  // Skills found in both mandatory and preferred: mandatory wins
  for (const s of mandatory) preferred.delete(s);

  return {
    mandatorySkills: [...mandatory],
    preferredSkills: [...preferred],
    generalRequirements: [...general],
    minExperienceYears: extractMinExperience(jdText),
    minEducation: extractMinEducation(jdText),
  };
}

module.exports = {
  classifyJD,
  extractMinExperience,
  extractMinEducation,
  extractSkillsFromLine,
  MANDATORY_CUES,
  PREFERRED_CUES,
};
