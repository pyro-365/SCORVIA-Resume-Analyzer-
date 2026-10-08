'use strict';

/**
 * negativeContextDetector.js
 * Detects whether a skill mention is negated by nearby cue words.
 */

const NEGATION_CUES = [
  'no', 'not', 'never', 'without', 'lack', 'lacking', 'none',
  'zero', 'absence', 'absent', 'beginner', 'beginner level',
  'novice', 'unfamiliar', 'inexperienced', 'no experience',
  'no knowledge', 'limited knowledge', 'no background',
];

/**
 * Check if a term mention in text is negated by a nearby negation cue.
 * Looks within a window of `windowSize` words before the term occurrence.
 * @param {string} term  - skill/phrase to check
 * @param {string} text  - full text containing the term
 * @param {number} [windowSize=5]  - number of words to look back
 * @returns {boolean} true if the term appears negated
 */
function isNegated(term, text, windowSize = 5) {
  if (!term || !text) return false;
  const normText = text.toLowerCase();
  const normTerm = term.toLowerCase().trim();

  let idx = normText.indexOf(normTerm);
  while (idx !== -1) {
    // Extract the window of text before this occurrence
    const before = normText.slice(0, idx);
    const words = before.trim().split(/\s+/);
    const windowWords = words.slice(-windowSize);
    const windowStr = windowWords.join(' ');

    // Check if any negation cue is in the window
    if (NEGATION_CUES.some((cue) => windowStr.includes(cue))) {
      return true;
    }

    idx = normText.indexOf(normTerm, idx + 1);
  }
  return false;
}

/**
 * Filter a list of detected skills, removing any that are negated in context.
 * @param {string[]} skills  - list of canonical skill names detected
 * @param {string} text  - original resume text
 * @param {number} [windowSize=5]
 * @returns {{ confirmed: string[], negated: string[] }}
 */
function filterNegatedSkills(skills, text, windowSize = 5) {
  const confirmed = [];
  const negated = [];
  for (const skill of skills) {
    if (isNegated(skill, text, windowSize)) {
      negated.push(skill);
    } else {
      confirmed.push(skill);
    }
  }
  return { confirmed, negated };
}

module.exports = { isNegated, filterNegatedSkills, NEGATION_CUES };
