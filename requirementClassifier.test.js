'use strict';

const {
  classifyJD,
  extractMinExperience,
  extractMinEducation,
} = require('../src/requirementClassifier');

describe('classifyJD', () => {
  test('returns empty arrays for empty input', () => {
    const result = classifyJD('');
    expect(result.mandatorySkills).toEqual([]);
    expect(result.preferredSkills).toEqual([]);
    expect(result.minExperienceYears).toBe(0);
  });

  test('classifies mandatory skills from "must have" cue', () => {
    const jd = 'Must have: Python, SQL, Docker';
    const result = classifyJD(jd);
    expect(result.mandatorySkills).toContain('python');
    expect(result.mandatorySkills).toContain('sql');
    expect(result.mandatorySkills).toContain('docker');
  });

  test('classifies preferred skills from "preferred" cue', () => {
    const jd = 'Preferred skills: React, TypeScript';
    const result = classifyJD(jd);
    expect(result.preferredSkills).toContain('react');
    expect(result.preferredSkills).toContain('typescript');
  });

  test('mandatory wins over preferred for the same skill', () => {
    const jd = `
      Must have: Python
      Preferred: Python, React
    `;
    const result = classifyJD(jd);
    expect(result.mandatorySkills).toContain('python');
    expect(result.preferredSkills).not.toContain('python');
  });

  test('handles multi-section JD', () => {
    const jd = `
      Required skills:
      - Python
      - SQL
      - Docker

      Nice to have:
      - React
      - TypeScript

      Minimum 3 years of experience.
      Bachelor's degree required.
    `;
    const result = classifyJD(jd);
    expect(result.mandatorySkills.length).toBeGreaterThan(0);
    expect(result.minExperienceYears).toBe(3);
    expect(result.minEducation).toBe('bachelors');
  });
});

describe('extractMinExperience', () => {
  test('extracts years from "X years of experience"', () => {
    expect(extractMinExperience('5 years of experience required')).toBe(5);
  });
  test('extracts from "minimum X years"', () => {
    expect(extractMinExperience('minimum 3 years of professional experience')).toBe(3);
  });
  test('extracts from "at least X years"', () => {
    expect(extractMinExperience('at least 2 years experience')).toBe(2);
  });
  test('returns 0 if no experience mentioned', () => {
    expect(extractMinExperience('Looking for a developer')).toBe(0);
  });
  test('takes the highest value mentioned', () => {
    expect(extractMinExperience('2 years frontend, 5 years total experience')).toBe(5);
  });
});

describe('extractMinEducation', () => {
  test('detects bachelors from "bachelor"', () => {
    expect(extractMinEducation('Bachelor\'s degree in Computer Science')).toBe('bachelors');
  });
  test('detects bachelors from "B.Tech"', () => {
    expect(extractMinEducation('B.Tech or equivalent required')).toBe('bachelors');
  });
  test('detects masters', () => {
    expect(extractMinEducation('Master\'s degree preferred')).toBe('masters');
  });
  test('detects phd', () => {
    expect(extractMinEducation('PhD in Machine Learning')).toBe('phd');
  });
  test('returns empty string if not found', () => {
    expect(extractMinEducation('Looking for motivated candidates')).toBe('');
  });
});
