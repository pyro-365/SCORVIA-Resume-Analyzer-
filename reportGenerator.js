'use strict';

/**
 * reportGenerator.js
 * Generates human-readable explanation bullet points and recommendation labels.
 */

/**
 * Score thresholds for recommendation labels.
 */
const THRESHOLDS = {
  suitable: 70,
  partial: 45,
};

/**
 * Generate a recommendation label based on final score and missing mandatory skills.
 * @param {number} finalScore  - 0 to 100
 * @param {string[]} missingMandatory
 * @returns {'Suitable' | 'Partially suitable' | 'Not suitable'}
 */
function generateRecommendation(finalScore, missingMandatory) {
  // Missing mandatory skills can override score-based label
  if (missingMandatory && missingMandatory.length > 0) {
    if (finalScore >= THRESHOLDS.suitable && missingMandatory.length <= 1) {
      return 'Partially suitable';
    }
    if (missingMandatory.length > 2) return 'Not suitable';
  }
  if (finalScore >= THRESHOLDS.suitable) return 'Suitable';
  if (finalScore >= THRESHOLDS.partial) return 'Partially suitable';
  return 'Not suitable';
}

/**
 * Generate a list of human-readable explanation bullet points for a ScoreResult.
 * @param {Object} scoreResult
 * @returns {string[]}
 */
function generateExplanation(scoreResult) {
  const {
    finalScore,
    mandatorySkillScore,
    preferredSkillScore,
    experienceScore,
    educationScore,
    matchedMandatory,
    missingMandatory,
    matchedPreferred,
    missingPreferred,
    negatedSkills,
    penaltyApplied,
  } = scoreResult;

  const lines = [];

  lines.push(`Overall Score: ${finalScore}%`);

  // Mandatory skills
  if (matchedMandatory && matchedMandatory.length > 0) {
    lines.push(`✓ Mandatory skills matched (${mandatorySkillScore}%): ${matchedMandatory.join(', ')}`);
  } else {
    lines.push(`✗ No mandatory skills matched (0%)`);
  }

  if (missingMandatory && missingMandatory.length > 0) {
    lines.push(`⚠ Missing mandatory skills: ${missingMandatory.join(', ')}`);
  }

  // Preferred skills
  if (matchedPreferred && matchedPreferred.length > 0) {
    lines.push(`✓ Preferred skills matched (${preferredSkillScore}%): ${matchedPreferred.join(', ')}`);
  } else {
    lines.push(`– No preferred skills matched`);
  }

  if (missingPreferred && missingPreferred.length > 0) {
    lines.push(`– Preferred skills not found: ${missingPreferred.join(', ')}`);
  }

  // Experience
  lines.push(`Experience match: ${experienceScore}%`);

  // Education
  lines.push(`Education match: ${educationScore}%`);

  // Negations
  if (negatedSkills && negatedSkills.length > 0) {
    lines.push(`⚠ Negated/disclaimed skills detected: ${negatedSkills.join(', ')}`);
  }

  // Penalty
  if (penaltyApplied && penaltyApplied > 0) {
    lines.push(`Score penalty applied: -${penaltyApplied}% (missing mandatory / negated skills)`);
  }

  return lines;
}

/**
 * Generate a full report object for a candidate.
 * @param {Object} scoreResult
 * @returns {{ recommendation: string, explanation: string[], score: number }}
 */
function generateReport(scoreResult) {
  const recommendation = generateRecommendation(
    scoreResult.finalScore,
    scoreResult.missingMandatory
  );
  const explanation = generateExplanation(scoreResult);
  return {
    recommendation,
    explanation,
    score: scoreResult.finalScore,
    fileName: scoreResult.fileName,
  };
}

module.exports = { generateExplanation, generateRecommendation, generateReport, THRESHOLDS };
