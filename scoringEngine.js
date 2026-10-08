'use strict';

/**
 * scoringEngine.js
 * Core weighted scoring formula.
 * Weights: mandatory=0.50, preferred=0.25, experience=0.15, education=0.10
 */

const { calculateExperienceScore } = require('./experienceExtractor');
const { calculateEducationScore } = require('./educationExtractor');

const DEFAULT_WEIGHTS = {
  mandatory: 0.50,
  preferred: 0.25,
  experience: 0.15,
  education: 0.10,
};

/** Penalty deducted per missing mandatory skill (applied before final weighting) */
const MISSING_MANDATORY_PENALTY = 0.05;
/** Penalty per negated skill claim */
const NEGATED_SKILL_PENALTY = 0.03;

/**
 * Calculate skill match score: (matched / total) or 0 if total is 0.
 * @param {string[]} required
 * @param {string[]} detected
 * @returns {{ score: number, matched: string[], missing: string[] }}
 */
function calculateSkillMatchScore(required, detected) {
  if (!required || required.length === 0) {
    return { score: 1, matched: [], missing: [] };
  }
  const detectedSet = new Set((detected || []).map((s) => s.toLowerCase()));
  const matched = required.filter((s) => detectedSet.has(s.toLowerCase()));
  const missing = required.filter((s) => !detectedSet.has(s.toLowerCase()));
  const score = matched.length / required.length;
  return { score, matched, missing };
}

/**
 * Calculate the final composite score for a resume against a JD.
 * @param {Object} jdModel  - JobDescription parsed model
 * @param {Object} resumeModel  - Resume parsed model
 * @param {Object} [weights]  - optional custom weights
 * @returns {Object} ScoreResult
 */
function calculateScores(jdModel, resumeModel, weights = DEFAULT_WEIGHTS) {
  const w = { ...DEFAULT_WEIGHTS, ...weights };

  // 1. Mandatory skills
  const mandatoryResult = calculateSkillMatchScore(
    jdModel.mandatorySkills || [],
    resumeModel.detectedSkills || []
  );

  // 2. Preferred skills
  const preferredResult = calculateSkillMatchScore(
    jdModel.preferredSkills || [],
    resumeModel.detectedSkills || []
  );

  // 3. Experience
  const experienceScore = calculateExperienceScore(
    resumeModel.detectedExperienceYears || 0,
    jdModel.minExperienceYears || 0
  );

  // 4. Education
  const educationScore = calculateEducationScore(
    resumeModel.detectedEducation || '',
    jdModel.minEducation || ''
  );

  // 5. Raw weighted score
  let rawScore =
    w.mandatory * mandatoryResult.score +
    w.preferred * preferredResult.score +
    w.experience * experienceScore +
    w.education * educationScore;

  // 6. Apply penalties
  const missingMandatoryCount = mandatoryResult.missing.length;
  const negatedCount = (resumeModel.negatedSkills || []).length;

  const penalty =
    missingMandatoryCount * MISSING_MANDATORY_PENALTY +
    negatedCount * NEGATED_SKILL_PENALTY;

  const finalScore = Math.max(0, Math.min(1, rawScore - penalty));
  const finalScorePercent = Math.round(finalScore * 100);

  return {
    fileName: resumeModel.fileName || 'unknown',
    mandatorySkillScore: Math.round(mandatoryResult.score * 100),
    preferredSkillScore: Math.round(preferredResult.score * 100),
    experienceScore: Math.round(experienceScore * 100),
    educationScore: Math.round(educationScore * 100),
    finalScore: finalScorePercent,
    matchedMandatory: mandatoryResult.matched,
    missingMandatory: mandatoryResult.missing,
    matchedPreferred: preferredResult.matched,
    missingPreferred: preferredResult.missing,
    negatedSkills: resumeModel.negatedSkills || [],
    penaltyApplied: Math.round(penalty * 100),
  };
}

module.exports = {
  calculateScores,
  calculateSkillMatchScore,
  DEFAULT_WEIGHTS,
  MISSING_MANDATORY_PENALTY,
  NEGATED_SKILL_PENALTY,
};
