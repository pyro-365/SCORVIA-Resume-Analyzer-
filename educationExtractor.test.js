'use strict';

const { extractEducationLevel, calculateEducationScore, getEducationRank } = require('../src/educationExtractor');

describe('extractEducationLevel', () => {
  test('detects bachelor from "B.Tech"', () => {
    expect(extractEducationLevel('B.Tech in Computer Science')).toBe('bachelors');
  });
  test('detects bachelor from "Bachelor of Engineering"', () => {
    expect(extractEducationLevel('Bachelor of Engineering, 2018')).toBe('bachelors');
  });
  test('detects masters from "Master of Science"', () => {
    expect(extractEducationLevel('Master of Science in AI')).toBe('masters');
  });
  test('detects masters from "MBA"', () => {
    expect(extractEducationLevel('MBA from IIM')).toBe('masters');
  });
  test('detects phd from "PhD"', () => {
    expect(extractEducationLevel('PhD in Computer Vision')).toBe('phd');
  });
  test('detects phd from "doctorate"', () => {
    expect(extractEducationLevel('Completed my doctorate in 2019')).toBe('phd');
  });
  test('detects diploma', () => {
    expect(extractEducationLevel('3-year Diploma in Electronics')).toBe('diploma');
  });
  test('returns highest level when multiple found', () => {
    // Masters should win over bachelors
    expect(extractEducationLevel('B.Tech followed by M.Tech in CS')).toBe('masters');
  });
  test('returns empty string when not found', () => {
    expect(extractEducationLevel('Self-taught developer with no formal degree')).toBe('');
  });
  test('handles empty input', () => {
    expect(extractEducationLevel('')).toBe('');
    expect(extractEducationLevel(null)).toBe('');
  });
});

describe('calculateEducationScore', () => {
  test('returns 1 when resume meets requirement', () => {
    expect(calculateEducationScore('bachelors', 'bachelors')).toBe(1);
    expect(calculateEducationScore('masters', 'bachelors')).toBe(1);
    expect(calculateEducationScore('phd', 'masters')).toBe(1);
  });
  test('returns 1 when no requirement', () => {
    expect(calculateEducationScore('bachelors', '')).toBe(1);
    expect(calculateEducationScore('', '')).toBe(1);
  });
  test('returns 0 when resume has no education and requirement exists', () => {
    expect(calculateEducationScore('', 'bachelors')).toBe(0);
  });
  test('returns partial score when one level below', () => {
    expect(calculateEducationScore('diploma', 'bachelors')).toBe(0.5);
  });
});

describe('getEducationRank', () => {
  test('returns correct ranks', () => {
    expect(getEducationRank('highschool')).toBe(1);
    expect(getEducationRank('diploma')).toBe(2);
    expect(getEducationRank('bachelors')).toBe(3);
    expect(getEducationRank('masters')).toBe(4);
    expect(getEducationRank('phd')).toBe(5);
  });
  test('returns 0 for unknown level', () => {
    expect(getEducationRank('unknown')).toBe(0);
    expect(getEducationRank('')).toBe(0);
  });
});
