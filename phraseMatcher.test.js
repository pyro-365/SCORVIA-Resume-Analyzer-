'use strict';

const { findPhrases, findCanonicalSkills } = require('../src/phraseMatcher');
const { getCanonicalSkill, getAllVariants } = require('../src/skillDictionary');

describe('findPhrases', () => {
  const phrases = ['machine learning', 'deep learning', 'natural language processing', 'python', 'java'];

  test('finds a single-word phrase', () => {
    const result = findPhrases('I know Python and Java.', phrases);
    expect(result).toContain('python');
    expect(result).toContain('java');
  });

  test('finds multi-word phrase', () => {
    const result = findPhrases('Experience in machine learning and deep learning.', phrases);
    expect(result).toContain('machine learning');
    expect(result).toContain('deep learning');
  });

  test('does not match phrase inside another word', () => {
    // "java" should not match inside "javascript" as a separate phrase if boundaries are checked
    const result = findPhrases('javascript developer', ['java']);
    // 'java' appears in 'javascript' but no word boundary after 'java' before 's'
    expect(result).not.toContain('java');
  });

  test('longer phrase takes priority over shorter', () => {
    const result = findPhrases('machine learning engineer', ['machine', 'machine learning']);
    expect(result).toContain('machine learning');
  });

  test('returns empty for no match', () => {
    const result = findPhrases('I love cooking and hiking.', phrases);
    expect(result).toEqual([]);
  });

  test('handles empty text', () => {
    expect(findPhrases('', phrases)).toEqual([]);
  });

  test('handles null phraseList', () => {
    expect(findPhrases('some text', null)).toEqual([]);
  });
});

describe('findCanonicalSkills', () => {
  test('resolves matched phrases to canonical skill names', () => {
    const variants = getAllVariants();
    const result = findCanonicalSkills(
      'I have experience with ML and kubernetes (k8s).',
      variants,
      getCanonicalSkill
    );
    expect(result).toContain('machine learning');
    expect(result).toContain('kubernetes');
  });

  test('deduplicates the same skill matched via multiple variants', () => {
    const variants = ['ml', 'machine learning'];
    const result = findCanonicalSkills(
      'ml and machine learning skills',
      variants,
      getCanonicalSkill
    );
    const count = result.filter((r) => r === 'machine learning').length;
    expect(count).toBe(1);
  });
});
