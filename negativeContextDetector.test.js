'use strict';

const { isNegated, filterNegatedSkills } = require('../src/negativeContextDetector');

describe('isNegated', () => {
  test('detects negation: "no experience in Java"', () => {
    expect(isNegated('java', 'no experience in java')).toBe(true);
  });

  test('detects negation: "not familiar with Python"', () => {
    expect(isNegated('python', 'I am not familiar with python')).toBe(true);
  });

  test('detects negation: "without SQL knowledge"', () => {
    expect(isNegated('sql', 'without sql knowledge')).toBe(true);
  });

  test('does NOT flag positive context: "experienced in Java"', () => {
    expect(isNegated('java', 'experienced in java for 5 years')).toBe(false);
  });

  test('does NOT flag positive context: "proficient in Python"', () => {
    expect(isNegated('python', 'proficient in python and machine learning')).toBe(false);
  });

  test('does NOT flag mention far from negation', () => {
    // Negation is many words before the skill — outside window
    expect(isNegated('react', 'no excel skills and I am highly proficient in react js development')).toBe(false);
  });

  test('detects "beginner" as negation cue', () => {
    expect(isNegated('kubernetes', 'beginner kubernetes user')).toBe(true);
  });

  test('returns false for empty inputs', () => {
    expect(isNegated('', 'some text')).toBe(false);
    expect(isNegated('java', '')).toBe(false);
  });
});

describe('filterNegatedSkills', () => {
  test('separates confirmed from negated skills', () => {
    const skills = ['java', 'python', 'sql'];
    const text = 'No experience in java. Proficient in python. without sql knowledge.';
    const result = filterNegatedSkills(skills, text);
    expect(result.negated).toContain('java');
    expect(result.negated).toContain('sql');
    expect(result.confirmed).toContain('python');
  });

  test('returns all confirmed if no negation', () => {
    const skills = ['react', 'nodejs'];
    const text = 'Highly skilled in react and nodejs.';
    const result = filterNegatedSkills(skills, text);
    expect(result.confirmed).toEqual(expect.arrayContaining(['react', 'nodejs']));
    expect(result.negated).toHaveLength(0);
  });
});
