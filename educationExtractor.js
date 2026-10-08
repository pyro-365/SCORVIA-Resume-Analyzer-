'use strict';

/**
 * educationExtractor.js
 * Extracts education level from resume text and compares against JD requirements.
 */

/** Ordered education levels: higher index = higher degree */
const EDUCATION_SCALE = [
  { level: 'highschool', rank: 1, keywords: ['high school', 'secondary school', 'hsc', 'ssc', '12th'] },
  { level: 'diploma',    rank: 2, keywords: ['diploma', 'associate', 'a.s', 'polytechnic'] },
  { level: 'bachelors',  rank: 3, keywords: ['bachelor', 'bachelors', 'b.s', 'bs ', 'bsc', 'b.e', 'be ', 'b.tech', 'btech', 'b.sc', 'undergraduate', 'b.com', 'b.a', 'ba '] },
  { level: 'masters',    rank: 4, keywords: ['master', 'masters', 'm.s', 'ms ', 'msc', 'mba', 'm.tech', 'mtech', 'm.e', 'me ', 'm.com', 'm.a', 'postgraduate', 'pg diploma'] },
  { level: 'phd',        rank: 5, keywords: ['phd', 'ph.d', 'doctorate', 'doctoral', 'd.phil'] },
];

/**
 * Extract the highest detected education level from text.
 * @param {string} text
 * @returns {string} education level key, or '' if not found
 */
function extractEducationLevel(text) {
  if (!text || typeof text !== 'string') return '';
  const lower = text.toLowerCase();

  // Check from highest to lowest to return the highest found
  for (let i = EDUCATION_SCALE.length - 1; i >= 0; i--) {
    const { level, keywords } = EDUCATION_SCALE[i];
    if (keywords.some((kw) => lower.includes(kw))) {
      return level;
    }
  }
  return '';
}

/**
 * Get the numeric rank of an education level string.
 * @param {string} level
 * @returns {number} rank (0 if unknown)
 */
function getEducationRank(level) {
  const entry = EDUCATION_SCALE.find((e) => e.level === level);
  return entry ? entry.rank : 0;
}

/**
 * Calculate education match score.
 * @param {string} resumeLevel  - detected from resume
 * @param {string} requiredLevel  - extracted from JD
 * @returns {number} 0 to 1
 */
function calculateEducationScore(resumeLevel, requiredLevel) {
  if (!requiredLevel) return 1; // no requirement = full score
  const resumeRank = getEducationRank(resumeLevel);
  const requiredRank = getEducationRank(requiredLevel);
  if (requiredRank === 0) return 1;
  if (resumeRank >= requiredRank) return 1;
  if (resumeRank === 0) return 0;
  // Partial: one level below = 0.5, two below = 0.25
  const diff = requiredRank - resumeRank;
  return Math.max(0, 1 - diff * 0.5);
}

module.exports = {
  extractEducationLevel,
  calculateEducationScore,
  getEducationRank,
  EDUCATION_SCALE,
};
