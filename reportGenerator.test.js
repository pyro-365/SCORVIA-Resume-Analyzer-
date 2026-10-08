'use strict';

const { generateExplanation, generateRecommendation, generateReport } = require('../src/reportGenerator');

const GOOD_RESULT = {
  fileName: 'alice.txt',
  finalScore: 88,
  mandatorySkillScore: 100,
  preferredSkillScore: 50,
  experienceScore: 100,
  educationScore: 100,
  matchedMandatory: ['python', 'sql', 'docker'],
  missingMandatory: [],
  matchedPreferred: ['react'],
  missingPreferred: ['typescript'],
  negatedSkills: [],
  penaltyApplied: 0,
};

const POOR_RESULT = {
  fileName: 'bob.txt',
  finalScore: 32,
  mandatorySkillScore: 33,
  preferredSkillScore: 0,
  experienceScore: 50,
  educationScore: 100,
  matchedMandatory: ['python'],
  missingMandatory: ['sql', 'docker'],
  matchedPreferred: [],
  missingPreferred: ['react', 'typescript'],
  negatedSkills: ['java'],
  penaltyApplied: 13,
};

describe('generateRecommendation', () => {
  test('returns Suitable for high score with no missing mandatory', () => {
    expect(generateRecommendation(88, [])).toBe('Suitable');
    expect(generateRecommendation(70, [])).toBe('Suitable');
  });

  test('returns Partially suitable for mid score', () => {
    expect(generateRecommendation(55, [])).toBe('Partially suitable');
    expect(generateRecommendation(45, [])).toBe('Partially suitable');
  });

  test('returns Not suitable for low score', () => {
    expect(generateRecommendation(30, [])).toBe('Not suitable');
    expect(generateRecommendation(0, [])).toBe('Not suitable');
  });

  test('downgrades to Partially suitable when high score but 1 missing mandatory', () => {
    expect(generateRecommendation(80, ['docker'])).toBe('Partially suitable');
  });

  test('returns Not suitable when >2 missing mandatory regardless of score', () => {
    expect(generateRecommendation(75, ['sql', 'docker', 'aws'])).toBe('Not suitable');
  });
});

describe('generateExplanation', () => {
  test('includes overall score', () => {
    const lines = generateExplanation(GOOD_RESULT);
    expect(lines.some((l) => l.includes('88%'))).toBe(true);
  });

  test('lists matched mandatory skills', () => {
    const lines = generateExplanation(GOOD_RESULT);
    expect(lines.some((l) => l.includes('python') && l.includes('sql') && l.includes('docker'))).toBe(true);
  });

  test('lists missing mandatory skills for poor result', () => {
    const lines = generateExplanation(POOR_RESULT);
    expect(lines.some((l) => l.toLowerCase().includes('missing') && l.includes('sql'))).toBe(true);
  });

  test('mentions negated skills', () => {
    const lines = generateExplanation(POOR_RESULT);
    expect(lines.some((l) => l.toLowerCase().includes('negated') && l.includes('java'))).toBe(true);
  });

  test('mentions penalty when applied', () => {
    const lines = generateExplanation(POOR_RESULT);
    expect(lines.some((l) => l.toLowerCase().includes('penalty'))).toBe(true);
  });

  test('does not mention penalty when zero', () => {
    const lines = generateExplanation(GOOD_RESULT);
    expect(lines.some((l) => l.toLowerCase().includes('penalty'))).toBe(false);
  });
});

describe('generateReport', () => {
  test('returns recommendation, explanation, score, and fileName', () => {
    const report = generateReport(GOOD_RESULT);
    expect(report).toHaveProperty('recommendation');
    expect(report).toHaveProperty('explanation');
    expect(report).toHaveProperty('score');
    expect(report).toHaveProperty('fileName');
    expect(report.fileName).toBe('alice.txt');
    expect(report.score).toBe(88);
    expect(report.recommendation).toBe('Suitable');
  });

  test('recommendation matches generateRecommendation output', () => {
    const report = generateReport(POOR_RESULT);
    expect(report.recommendation).toBe('Not suitable');
  });
});
