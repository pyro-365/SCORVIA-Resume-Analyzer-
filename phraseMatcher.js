'use strict';

/**
 * phraseMatcher.js
 * Multi-word skill phrase detection using sliding-window substring matching.
 * No regex NLP libraries — plain string operations only.
 */

/**
 * Normalize text for comparison (lowercase, collapse whitespace).
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find all phrases from phraseList that appear in text.
 * Uses longest-match-first to avoid partial overlaps.
 * @param {string} text  - raw or cleaned resume/JD text
 * @param {string[]} phraseList  - list of phrases to search for
 * @returns {string[]} matched phrases (original casing from phraseList)
 */
function findPhrases(text, phraseList) {
  if (!text || !Array.isArray(phraseList)) return [];
  const normText = normalize(text);
  const matched = [];
  const usedRanges = []; // track character ranges to avoid double-counting overlaps

  // Sort by descending length so longer (more specific) phrases match first
  const sorted = [...phraseList].sort((a, b) => b.length - a.length);

  for (const phrase of sorted) {
    if (!phrase) continue;
    const normPhrase = normalize(phrase);
    let idx = normText.indexOf(normPhrase);

    while (idx !== -1) {
      const end = idx + normPhrase.length;
      // Ensure there's a word boundary before and after
      const charBefore = normText[idx - 1];
      const charAfter = normText[end];
      const boundaryBefore = idx === 0 || /\s/.test(charBefore);
      const boundaryAfter = end === normText.length || /[\s,;.!?]/.test(charAfter);

      if (boundaryBefore && boundaryAfter) {
        // Check it doesn't overlap with an already matched range
        const overlaps = usedRanges.some((r) => idx < r.end && end > r.start);
        if (!overlaps) {
          matched.push(phrase);
          usedRanges.push({ start: idx, end });
        }
      }
      idx = normText.indexOf(normPhrase, idx + 1);
    }
  }

  return matched;
}

/**
 * Find skill phrases in text and return their canonical names.
 * @param {string} text
 * @param {string[]} phraseList  - all skill variants
 * @param {function(string): string|null} canonicalize  - getCanonicalSkill fn
 * @returns {string[]} unique canonical skill names matched
 */
function findCanonicalSkills(text, phraseList, canonicalize) {
  const phrases = findPhrases(text, phraseList);
  const canonicals = new Set();
  for (const phrase of phrases) {
    const canonical = canonicalize(phrase);
    if (canonical) canonicals.add(canonical);
  }
  return [...canonicals];
}

module.exports = { findPhrases, findCanonicalSkills };
