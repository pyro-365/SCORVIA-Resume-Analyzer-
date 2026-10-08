'use strict';

const { extractYearsOfExperience, calculateExperienceScore } = require('../src/experienceExtractor');

describe('extractYearsOfExperience', () => {
  test('extracts "5 years of experience"', () => {
    expect(extractYearsOfExperience('5 years of experience in Python')).toBe(5);
  });

  test('extracts "3+ years experience"', () => {
    expect(extractYearsOfExperience('3+ years experience with React')).toBe(3);
  });

  test('extracts "over 4 years of experience"', () => {
    expect(extractYearsOfExperience('over 4 years of experience in software development')).toBe(4);
  });

  test('extracts word-form "three years of experience"', () => {
    expect(extractYearsOfExperience('three years of experience in ML')).toBe(3);
  });

  test('extracts "more than 2 years of experience"', () => {
    expect(extractYearsOfExperience('more than 2 years of experience')).toBe(2);
  });

  test('returns maximum when multiple mentions', () => {
    expect(extractYearsOfExperience('2 years frontend, 5 years total experience')).toBe(5);
  });

  test('returns 0 when no experience mentioned', () => {
    expect(extractYearsOfExperience('Looking for a new role.')).toBe(0);
  });

  test('returns 0 for empty input', () => {
    expect(extractYearsOfExperience('')).toBe(0);
    expect(extractYearsOfExperience(null)).toBe(0);
  });

  test('extracts "5-7 years of experience"', () => {
    expect(extractYearsOfExperience('5-7 years of experience required')).toBe(5);
  });
});

describe('calculateExperienceScore', () => {
  test('returns 1 when resume meets requirement', () => {
    expect(calculateExperienceScore(5, 3)).toBe(1);
    expect(calculateExperienceScore(3, 3)).toBe(1);
  });

  test('returns 1 when no requirement (0)', () => {
    expect(calculateExperienceScore(0, 0)).toBe(1);
    expect(calculateExperienceScore(5, 0)).toBe(1);
  });

  test('returns 0 when resume has 0 years and requirement > 0', () => {
    expect(calculateExperienceScore(0, 5)).toBe(0);
  });

  test('returns partial score when below requirement', () => {
    expect(calculateExperienceScore(2, 4)).toBeCloseTo(0.5);
    expect(calculateExperienceScore(3, 5)).toBeCloseTo(0.6);
  });
});
