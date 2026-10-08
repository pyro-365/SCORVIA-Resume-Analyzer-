'use strict';

/**
 * rankingEngine.js
 * Sorts ScoreResult objects by finalScore descending with tie-breaking rules.
 */

/**
 * Rank candidates by final score (descending).
 * Tie-breaking rules (in order):
 *   1. More matched mandatory skills wins.
 *   2. More matched preferred skills wins.
 *   3. Higher experience score wins.
 *   4. Alphabetical by fileName (deterministic).
 * @param {Object[]} scoreResults  - array of ScoreResult objects
 * @returns {Object[]} sorted array with added `rank` property (1-indexed)
 */
function rankCandidates(scoreResults) {
  if (!Array.isArray(scoreResults) || scoreResults.length === 0) return [];

  const sorted = [...scoreResults].sort((a, b) => {
    // Primary: finalScore descending
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;

    // Tie-break 1: more matched mandatory skills
    const aMandatory = (a.matchedMandatory || []).length;
    const bMandatory = (b.matchedMandatory || []).length;
    if (bMandatory !== aMandatory) return bMandatory - aMandatory;

    // Tie-break 2: more matched preferred skills
    const aPreferred = (a.matchedPreferred || []).length;
    const bPreferred = (b.matchedPreferred || []).length;
    if (bPreferred !== aPreferred) return bPreferred - aPreferred;

    // Tie-break 3: higher experience score
    if (b.experienceScore !== a.experienceScore) return b.experienceScore - a.experienceScore;

    // Tie-break 4: alphabetical by fileName
    return (a.fileName || '').localeCompare(b.fileName || '');
  });

  return sorted.map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
}

module.exports = { rankCandidates };
