'use strict';

const { rankCandidates } = require('../src/rankingEngine');

describe('rankCandidates', () => {
  const makeResult = (overrides) => ({
    fileName: 'resume.txt',
    finalScore: 70,
    matchedMandatory: ['python'],
    matchedPreferred: [],
    experienceScore: 60,
    ...overrides,
  });

  test('sorts by finalScore descending', () => {
    const input = [
      makeResult({ fileName: 'c.txt', finalScore: 60 }),
      makeResult({ fileName: 'a.txt', finalScore: 85 }),
      makeResult({ fileName: 'b.txt', finalScore: 75 }),
    ];
    const result = rankCandidates(input);
    expect(result[0].fileName).toBe('a.txt');
    expect(result[1].fileName).toBe('b.txt');
    expect(result[2].fileName).toBe('c.txt');
  });

  test('assigns sequential rank starting at 1', () => {
    const input = [
      makeResult({ fileName: 'a.txt', finalScore: 90 }),
      makeResult({ fileName: 'b.txt', finalScore: 70 }),
    ];
    const result = rankCandidates(input);
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  test('tie-break: more matched mandatory skills wins', () => {
    const input = [
      makeResult({ fileName: 'a.txt', finalScore: 80, matchedMandatory: ['python'] }),
      makeResult({ fileName: 'b.txt', finalScore: 80, matchedMandatory: ['python', 'sql', 'docker'] }),
    ];
    const result = rankCandidates(input);
    expect(result[0].fileName).toBe('b.txt');
  });

  test('tie-break: more matched preferred skills wins when mandatory tied', () => {
    const input = [
      makeResult({ fileName: 'a.txt', finalScore: 80, matchedMandatory: ['python', 'sql'], matchedPreferred: [] }),
      makeResult({ fileName: 'b.txt', finalScore: 80, matchedMandatory: ['python', 'sql'], matchedPreferred: ['react', 'typescript'] }),
    ];
    const result = rankCandidates(input);
    expect(result[0].fileName).toBe('b.txt');
  });

  test('tie-break: alphabetical by fileName as last resort', () => {
    const input = [
      makeResult({ fileName: 'z_resume.txt', finalScore: 80, matchedMandatory: ['python'], matchedPreferred: [], experienceScore: 80 }),
      makeResult({ fileName: 'a_resume.txt', finalScore: 80, matchedMandatory: ['python'], matchedPreferred: [], experienceScore: 80 }),
    ];
    const result = rankCandidates(input);
    expect(result[0].fileName).toBe('a_resume.txt');
  });

  test('returns empty array for empty input', () => {
    expect(rankCandidates([])).toEqual([]);
  });

  test('returns empty array for non-array input', () => {
    expect(rankCandidates(null)).toEqual([]);
  });

  test('single candidate gets rank 1', () => {
    const result = rankCandidates([makeResult({ fileName: 'only.txt', finalScore: 55 })]);
    expect(result[0].rank).toBe(1);
  });
});
