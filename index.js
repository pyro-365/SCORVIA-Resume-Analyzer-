'use strict';

/**
 * index.js
 * Barrel export for the resume screening engine.
 * Import this from the frontend or backend via: require('@resume-screening/engine')
 */

const textPreprocessor = require('./textPreprocessor');
const skillDictionary = require('./skillDictionary');
const requirementClassifier = require('./requirementClassifier');
const sectionDetector = require('./sectionDetector');
const phraseMatcher = require('./phraseMatcher');
const negativeContextDetector = require('./negativeContextDetector');
const experienceExtractor = require('./experienceExtractor');
const educationExtractor = require('./educationExtractor');
const scoringEngine = require('./scoringEngine');
const rankingEngine = require('./rankingEngine');
const reportGenerator = require('./reportGenerator');

module.exports = {
  textPreprocessor,
  skillDictionary,
  requirementClassifier,
  sectionDetector,
  phraseMatcher,
  negativeContextDetector,
  experienceExtractor,
  educationExtractor,
  scoringEngine,
  rankingEngine,
  reportGenerator,
};
