'use strict';

/**
 * textPreprocessor.js
 * Pure text cleaning and tokenization utilities.
 * No external dependencies.
 */

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','dare','ought','used','about','above','after',
  'again','against','all','any','both','during','each','few','further',
  'here','how','i','if','into','just','me','more','most','my','no',
  'nor','not','now','only','other','our','out','own','same','so','some',
  'such','than','that','their','them','then','there','these','they',
  'this','those','through','too','under','until','up','us','very','we',
  'what','when','where','which','while','who','whom','why','you','your',
]);

/**
 * Convert text to lower case.
 * @param {string} text
 * @returns {string}
 */
function toLowerCase(text) {
  if (typeof text !== 'string') return '';
  return text.toLowerCase();
}

/**
 * Replace punctuation characters with spaces (preserve hyphens inside words).
 * @param {string} text
 * @returns {string}
 */
function removePunctuation(text) {
  if (typeof text !== 'string') return '';
  // Keep alphanumeric, spaces, hyphens between letters, plus signs
  return text.replace(/[^\w\s+/-]/g, ' ').replace(/_/g, ' ');
}

/**
 * Collapse multiple whitespace chars (including newlines/tabs) into one space.
 * @param {string} text
 * @returns {string}
 */
function collapseWhitespace(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Split text into an array of tokens (words).
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  if (typeof text !== 'string') return [];
  const cleaned = collapseWhitespace(removePunctuation(toLowerCase(text)));
  return cleaned.split(' ').filter(Boolean);
}

/**
 * Remove stop words from token array.
 * @param {string[]} tokens
 * @returns {string[]}
 */
function removeStopWords(tokens) {
  if (!Array.isArray(tokens)) return [];
  return tokens.filter((t) => !STOP_WORDS.has(t));
}

/**
 * Normalize a token to its canonical skill name using the skill dictionary.
 * Returns null if no match found.
 * @param {string} token
 * @param {Object} skillDictionary  - map of canonicalName -> { variants: string[] }
 * @returns {string|null}
 */
function normalizeVariant(token, skillDictionary) {
  if (!token || !skillDictionary) return null;
  const t = token.toLowerCase().trim();
  for (const [canonical, entry] of Object.entries(skillDictionary)) {
    if (canonical.toLowerCase() === t) return canonical;
    if (entry.variants && entry.variants.some((v) => v.toLowerCase() === t)) {
      return canonical;
    }
  }
  return null;
}

/**
 * Full preprocessing pipeline: lowercase -> remove punctuation ->
 * collapse whitespace -> tokenize -> remove stop words.
 * @param {string} text
 * @returns {string[]}
 */
function preprocessText(text) {
  return removeStopWords(tokenize(text));
}

module.exports = {
  toLowerCase,
  removePunctuation,
  collapseWhitespace,
  tokenize,
  removeStopWords,
  normalizeVariant,
  preprocessText,
  STOP_WORDS,
};
