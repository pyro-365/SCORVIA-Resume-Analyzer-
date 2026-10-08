'use strict';

/**
 * experienceExtractor.js
 * Extracts years of professional experience from resume text using regex patterns.
 */

const WORD_TO_NUMBER = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

const EXPERIENCE_PATTERNS = [
  // "5 years", "5+ years", "5-7 years [of] [qualifier] experience"
  // Allows up to 2 optional words between 'years' and 'experience' (e.g. 'total', 'of total')
  /(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:\w+\s+){0,2})?(?:experience|exp(?:erience)?)/gi,
  // "over 3 years [of] experience"
  /over\s+(\d+)\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:\w+\s+){0,2})?(?:experience|exp)/gi,
  // "more than 4 years [of] experience"
  /more\s+than\s+(\d+)\s*(?:years?|yrs?)(?:\s+(?:of\s+)?(?:\w+\s+){0,2})?(?:experience|exp)/gi,
  // "three years of experience" (word-form numbers)
  /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)\s+(?:years?|yrs?)(?:\s+(?:of\s+)?(?:\w+\s+){0,2})?(?:experience|exp)/gi,
];

/**
 * Extract the maximum years of experience mentioned in resume text.
 * @param {string} text
 * @returns {number} years of experience (0 if not found)
 */
function extractYearsOfExperience(text) {
  if (!text || typeof text !== 'string') return 0;

  let maxYears = 0;

  for (const pattern of EXPERIENCE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1];
      let years;
      if (/^\d+$/.test(raw)) {
        years = parseInt(raw, 10);
      } else {
        years = WORD_TO_NUMBER[raw.toLowerCase()] || 0;
      }
      if (years > maxYears) maxYears = years;
    }
  }

  return maxYears;
}

/**
 * Calculate an experience match score between resume and JD requirement.
 * @param {number} resumeYears
 * @param {number} requiredYears
 * @returns {number} score between 0 and 1
 */
function calculateExperienceScore(resumeYears, requiredYears) {
  if (requiredYears <= 0) return 1; // no requirement = full score
  if (resumeYears >= requiredYears) return 1;
  if (resumeYears <= 0) return 0;
  // Partial credit: proportional
  return Math.min(resumeYears / requiredYears, 1);
}

module.exports = { extractYearsOfExperience, calculateExperienceScore };
