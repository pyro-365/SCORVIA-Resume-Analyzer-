'use strict';

const {
  getCanonicalSkill,
  addSkill,
  getAllCanonicalSkills,
  getAllVariants,
  DEFAULT_SKILL_DICTIONARY,
} = require('../src/skillDictionary');

describe('getCanonicalSkill', () => {
  test('resolves a known variant to canonical skill', () => {
    expect(getCanonicalSkill('js')).toBe('javascript');
    expect(getCanonicalSkill('ml')).toBe('machine learning');
    expect(getCanonicalSkill('k8s')).toBe('kubernetes');
    expect(getCanonicalSkill('postgres')).toBe('postgresql');
  });

  test('resolves canonical name itself', () => {
    expect(getCanonicalSkill('python')).toBe('python');
    expect(getCanonicalSkill('docker')).toBe('docker');
  });

  test('is case-insensitive', () => {
    expect(getCanonicalSkill('JS')).toBe('javascript');
    expect(getCanonicalSkill('Python')).toBe('python');
    expect(getCanonicalSkill('DOCKER')).toBe('docker');
  });

  test('returns null for unknown term', () => {
    expect(getCanonicalSkill('cobol')).toBeNull();
    expect(getCanonicalSkill('fortran')).toBeNull();
    expect(getCanonicalSkill('')).toBeNull();
    expect(getCanonicalSkill(null)).toBeNull();
  });

  test('resolves multi-word variant', () => {
    expect(getCanonicalSkill('machine learning')).toBe('machine learning');
    expect(getCanonicalSkill('amazon web services')).toBe('aws');
  });
});

describe('addSkill', () => {
  test('adds a new skill and resolves it', () => {
    addSkill('rust', 'programming', ['rust', 'rust lang', 'rust programming']);
    expect(getCanonicalSkill('rust lang')).toBe('rust');
    expect(getCanonicalSkill('rust')).toBe('rust');
  });

  test('throws if name is empty', () => {
    expect(() => addSkill('', 'test', [])).toThrow();
  });
});

describe('getAllCanonicalSkills', () => {
  test('returns an array of strings', () => {
    const skills = getAllCanonicalSkills();
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
  });

  test('contains known canonical skills', () => {
    const skills = getAllCanonicalSkills();
    expect(skills).toContain('python');
    expect(skills).toContain('javascript');
    expect(skills).toContain('docker');
  });
});

describe('getAllVariants', () => {
  test('returns flat array of all variant strings', () => {
    const variants = getAllVariants();
    expect(Array.isArray(variants)).toBe(true);
    expect(variants).toContain('js');
    expect(variants).toContain('ml');
    expect(variants).toContain('k8s');
  });

  test('contains no duplicate variants', () => {
    const variants = getAllVariants();
    const unique = new Set(variants);
    expect(variants.length).toBe(unique.size);
  });
});
