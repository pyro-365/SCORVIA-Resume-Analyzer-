'use strict';

/**
 * skillDictionary.js
 * Default skill dictionary and lookup utilities.
 * No external dependencies.
 */

/** @type {Object.<string, {category: string, variants: string[]}>} */
const DEFAULT_SKILL_DICTIONARY = {
  javascript: {
    category: 'programming',
    variants: ['javascript', 'js', 'java script', 'ecmascript', 'es6', 'es2015'],
  },
  python: {
    category: 'programming',
    variants: ['python', 'python programming', 'python3', 'python 3'],
  },
  java: {
    category: 'programming',
    variants: ['java', 'java programming', 'java language'],
  },
  'c++': {
    category: 'programming',
    variants: ['c++', 'cpp', 'c plus plus'],
  },
  'c#': {
    category: 'programming',
    variants: ['c#', 'csharp', 'c sharp'],
  },
  typescript: {
    category: 'programming',
    variants: ['typescript', 'ts'],
  },
  react: {
    category: 'frontend',
    variants: ['react', 'reactjs', 'react.js', 'react js'],
  },
  angular: {
    category: 'frontend',
    variants: ['angular', 'angularjs', 'angular.js', 'angular js'],
  },
  'vue.js': {
    category: 'frontend',
    variants: ['vue', 'vuejs', 'vue.js', 'vue js'],
  },
  nodejs: {
    category: 'backend',
    variants: ['nodejs', 'node.js', 'node js', 'node'],
  },
  express: {
    category: 'backend',
    variants: ['express', 'expressjs', 'express.js'],
  },
  sql: {
    category: 'database',
    variants: ['sql', 'structured query language'],
  },
  mysql: {
    category: 'database',
    variants: ['mysql', 'my sql'],
  },
  postgresql: {
    category: 'database',
    variants: ['postgresql', 'postgres', 'psql'],
  },
  mongodb: {
    category: 'database',
    variants: ['mongodb', 'mongo', 'mongo db'],
  },
  'machine learning': {
    category: 'data',
    variants: ['machine learning', 'ml', 'machine-learning'],
  },
  'deep learning': {
    category: 'data',
    variants: ['deep learning', 'dl', 'deep-learning'],
  },
  tensorflow: {
    category: 'data',
    variants: ['tensorflow', 'tf', 'tensor flow'],
  },
  pytorch: {
    category: 'data',
    variants: ['pytorch', 'torch', 'py torch'],
  },
  docker: {
    category: 'devops',
    variants: ['docker', 'docker container', 'containerization'],
  },
  kubernetes: {
    category: 'devops',
    variants: ['kubernetes', 'k8s', 'kube'],
  },
  git: {
    category: 'devops',
    variants: ['git', 'git version control', 'github', 'gitlab', 'bitbucket'],
  },
  aws: {
    category: 'cloud',
    variants: ['aws', 'amazon web services', 'amazon aws'],
  },
  azure: {
    category: 'cloud',
    variants: ['azure', 'microsoft azure', 'azure cloud'],
  },
  agile: {
    category: 'methodology',
    variants: ['agile', 'agile methodology', 'scrum', 'kanban'],
  },
  rest: {
    category: 'api',
    variants: ['rest', 'restful', 'rest api', 'restful api'],
  },
  graphql: {
    category: 'api',
    variants: ['graphql', 'graph ql'],
  },
  linux: {
    category: 'os',
    variants: ['linux', 'unix', 'bash', 'shell scripting'],
  },
  ci_cd: {
    category: 'devops',
    variants: ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment', 'jenkins', 'github actions'],
  },
  testing: {
    category: 'quality',
    variants: ['testing', 'unit testing', 'jest', 'mocha', 'cypress', 'selenium', 'test automation'],
  },
};

/** Internal lookup map for O(1) resolution: variant -> canonicalName */
let _lookupMap = null;

/**
 * Build the variant -> canonical Map from the current dictionary.
 * @param {Object} dictionary
 * @returns {Map<string, string>}
 */
function buildLookupMap(dictionary) {
  const map = new Map();
  for (const [canonical, entry] of Object.entries(dictionary)) {
    map.set(canonical.toLowerCase(), canonical);
    if (entry.variants) {
      for (const variant of entry.variants) {
        map.set(variant.toLowerCase(), canonical);
      }
    }
  }
  return map;
}

/**
 * Get (or lazily build) the lookup map.
 * @returns {Map<string, string>}
 */
function getLookupMap() {
  if (!_lookupMap) {
    _lookupMap = buildLookupMap(DEFAULT_SKILL_DICTIONARY);
  }
  return _lookupMap;
}

/**
 * Resolve a term (variant or canonical) to its canonical skill name.
 * @param {string} term
 * @returns {string|null} canonical name, or null if not found
 */
function getCanonicalSkill(term) {
  if (!term) return null;
  const key = term.toLowerCase().trim();
  return getLookupMap().get(key) || null;
}

/**
 * Add a new skill to the default dictionary at runtime.
 * @param {string} name  - canonical skill name
 * @param {string} category
 * @param {string[]} variants
 */
function addSkill(name, category, variants) {
  if (!name) throw new Error('Skill name is required');
  DEFAULT_SKILL_DICTIONARY[name.toLowerCase()] = {
    category: category || 'other',
    variants: variants || [name.toLowerCase()],
  };
  // Invalidate cache
  _lookupMap = null;
}

/**
 * Get all canonical skill names.
 * @returns {string[]}
 */
function getAllCanonicalSkills() {
  return Object.keys(DEFAULT_SKILL_DICTIONARY);
}

/**
 * Get all variant strings (flat list) for multi-word phrase matching.
 * @returns {string[]}
 */
function getAllVariants() {
  const variants = [];
  for (const entry of Object.values(DEFAULT_SKILL_DICTIONARY)) {
    if (entry.variants) variants.push(...entry.variants);
  }
  return [...new Set(variants)];
}

module.exports = {
  DEFAULT_SKILL_DICTIONARY,
  getCanonicalSkill,
  addSkill,
  getAllCanonicalSkills,
  getAllVariants,
  buildLookupMap,
};
