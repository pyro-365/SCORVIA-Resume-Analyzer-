'use strict';

const {
  toLowerCase,
  removePunctuation,
  collapseWhitespace,
  tokenize,
  removeStopWords,
  normalizeVariant,
  preprocessText,
} = require('../src/textPreprocessor');

describe('toLowerCase', () => {
  test('converts to lowercase', () => {
    expect(toLowerCase('Hello WORLD')).toBe('hello world');
  });
  test('returns empty string for non-string input', () => {
    expect(toLowerCase(null)).toBe('');
    expect(toLowerCase(42)).toBe('');
  });
});

describe('removePunctuation', () => {
  test('removes commas, periods, exclamations', () => {
    const result = removePunctuation('Hello, World! Java.');
    expect(result).not.toContain(',');
    expect(result).not.toContain('!');
    expect(result).not.toContain('.');
  });
  test('preserves alphanumeric characters', () => {
    expect(removePunctuation('abc123')).toContain('abc123');
  });
  test('handles empty string', () => {
    expect(removePunctuation('')).toBe('');
  });
});

describe('collapseWhitespace', () => {
  test('collapses multiple spaces', () => {
    expect(collapseWhitespace('  hello   world  ')).toBe('hello world');
  });
  test('collapses newlines and tabs', () => {
    expect(collapseWhitespace('hello\n\tworld')).toBe('hello world');
  });
  test('trims leading and trailing spaces', () => {
    expect(collapseWhitespace('  test  ')).toBe('test');
  });
});

describe('tokenize', () => {
  test('splits text into tokens', () => {
    expect(tokenize('Java Python SQL')).toEqual(['java', 'python', 'sql']);
  });
  test('lowercases tokens and splits on punctuation', () => {
    // 'React.JS' — the dot is punctuation, so correctly splits to ['react', 'js']
    // Phrase matching handles multi-word variants (e.g. 'react js') separately
    const result = tokenize('React.JS');
    expect(result).toEqual(expect.arrayContaining(['react', 'js']));
    expect(result.every((t) => t === t.toLowerCase())).toBe(true);
  });
  test('filters empty tokens', () => {
    const result = tokenize('  hello   world  ');
    expect(result).not.toContain('');
  });
  test('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('removeStopWords', () => {
  test('removes common stop words', () => {
    const tokens = ['i', 'am', 'a', 'developer', 'and', 'data', 'scientist'];
    const result = removeStopWords(tokens);
    expect(result).not.toContain('i');
    expect(result).not.toContain('a');
    expect(result).not.toContain('and');
    expect(result).toContain('developer');
    expect(result).toContain('data');
    expect(result).toContain('scientist');
  });
  test('returns empty array for non-array input', () => {
    expect(removeStopWords(null)).toEqual([]);
  });
});

describe('normalizeVariant', () => {
  const dict = {
    javascript: { variants: ['js', 'java script', 'javascript'] },
    python: { variants: ['python', 'python programming'] },
    'machine learning': { variants: ['ml', 'machine learning'] },
  };

  test('resolves alias to canonical skill', () => {
    expect(normalizeVariant('js', dict)).toBe('javascript');
  });
  test('resolves exact canonical name', () => {
    expect(normalizeVariant('python', dict)).toBe('python');
  });
  test('resolves ml variant', () => {
    expect(normalizeVariant('ml', dict)).toBe('machine learning');
  });
  test('returns null for unknown term', () => {
    expect(normalizeVariant('cobol', dict)).toBeNull();
  });
  test('is case-insensitive', () => {
    expect(normalizeVariant('JS', dict)).toBe('javascript');
  });
});

describe('preprocessText', () => {
  test('full pipeline removes stop words and punctuation', () => {
    const result = preprocessText('I am a skilled Python developer and data scientist.');
    expect(result).toContain('python');
    expect(result).toContain('developer');
    expect(result).toContain('data');
    expect(result).not.toContain('i');
    expect(result).not.toContain('a');
    expect(result).not.toContain('and');
  });
});
