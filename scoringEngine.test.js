'use strict';

const { calculateScores, calculateSkillMatchScore } = require('../src/scoringEngine');

describe('calculateSkillMatchScore', () => {
  test('perfect match returns score 1', () => {
    const result = calculateSkillMatchScore(['python', 'sql'], ['python', 'sql', 'docker']);
    expect(result.score).toBe(1);
    expect(result.matched).toEqual(expect.arrayContaining(['python', 'sql']));
    expect(result.missing).toHaveLength(0);
  });

  test('partial match returns proportional score', () => {
    const result = calculateSkillMatchScore(['python', 'sql', 'docker'], ['python']);
    expect(result.score).toBeCloseTo(1 / 3);
    expect(result.matched).toContain('python');
    expect(result.missing).toContain('sql');
    expect(result.missing).toContain('docker');
  });

  test('no match returns score 0', () => {
    const result = calculateSkillMatchScore(['java', 'kotlin'], ['python', 'sql']);
    expect(result.score).toBe(0);
    expect(result.matched).toHaveLength(0);
  });

  test('empty required returns score 1', () => {
    const result = calculateSkillMatchScore([], ['python']);
    expect(result.score).toBe(1);
  });

  test('is case-insensitive', () => {
    const result = calculateSkillMatchScore(['Python', 'SQL'], ['python', 'sql']);
    expect(result.score).toBe(1);
  });
});

describe('calculateScores — full pipeline', () => {
  // Hand-calculated reference for verification:
  // JD: mandatory=[python, sql, docker], preferred=[react, typescript]
  //     minExp=3, minEdu=bachelors
  // Resume: detected=[python, sql, docker, react], exp=5, edu=bachelors
  // mandatoryScore = 3/3 = 1.0 -> weighted: 0.50
  // preferredScore = 1/2 = 0.5 -> weighted: 0.125
  // experienceScore = 1.0 (5>=3) -> weighted: 0.15
  // educationScore = 1.0 -> weighted: 0.10
  // rawScore = 0.50+0.125+0.15+0.10 = 0.875
  // penalty = 0 missing mandatory, 0 negated
  // finalScore = 87.5% -> rounded 88

  const jd = {
    mandatorySkills: ['python', 'sql', 'docker'],
    preferredSkills: ['react', 'typescript'],
    minExperienceYears: 3,
    minEducation: 'bachelors',
  };

  const resume = {
    fileName: 'candidate_a.txt',
    detectedSkills: ['python', 'sql', 'docker', 'react'],
    negatedSkills: [],
    detectedExperienceYears: 5,
    detectedEducation: 'bachelors',
  };

  test('hand-calculated example produces expected score ~88', () => {
    const result = calculateScores(jd, resume);
    expect(result.finalScore).toBe(88);
    expect(result.mandatorySkillScore).toBe(100);
    expect(result.preferredSkillScore).toBe(50);
    expect(result.experienceScore).toBe(100);
    expect(result.educationScore).toBe(100);
  });

  test('missing mandatory skills apply penalty', () => {
    const resumeWithMissing = {
      ...resume,
      detectedSkills: ['python'],  // missing sql and docker
    };
    const result = calculateScores(jd, resumeWithMissing);
    // mandatory = 1/3, penalty = 2 * 0.05 = 0.10
    const expected = Math.round(
      Math.max(0, 0.50 * (1/3) + 0.25 * 0 + 0.15 * 1 + 0.10 * 1 - 0.10) * 100
    );
    expect(result.finalScore).toBe(expected);
    expect(result.missingMandatory).toContain('sql');
    expect(result.missingMandatory).toContain('docker');
  });

  test('negated skills apply penalty', () => {
    const resumeWithNegation = {
      ...resume,
      negatedSkills: ['python'],
    };
    const result = calculateScores(jd, resumeWithNegation);
    expect(result.penaltyApplied).toBeGreaterThan(0);
  });

  test('zero experience when required returns lower score', () => {
    const resumeNoExp = { ...resume, detectedExperienceYears: 0 };
    const resultFull = calculateScores(jd, resume);
    const resultNoExp = calculateScores(jd, resumeNoExp);
    expect(resultNoExp.finalScore).toBeLessThan(resultFull.finalScore);
  });

  test('fileName is preserved in result', () => {
    const result = calculateScores(jd, resume);
    expect(result.fileName).toBe('candidate_a.txt');
  });
});
