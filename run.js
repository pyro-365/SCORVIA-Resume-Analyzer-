#!/usr/bin/env node
'use strict';

/**
 * CLI harness for the Resume Screening Engine.
 * Usage:
 *   node engine/cli/run.js --jd engine/cli/samples/jd.txt --resumes engine/cli/samples/
 *   node engine/cli/run.js --jd path/to/jd.txt --resumes path/to/resumes/
 */

const fs = require('fs');
const path = require('path');

// Load engine modules relative to this CLI file
const engine = require('../src/index');
const { requirementClassifier, sectionDetector, phraseMatcher, negativeContextDetector,
        experienceExtractor, educationExtractor, scoringEngine, rankingEngine,
        reportGenerator, skillDictionary } = engine;

// ---- Argument parsing ----
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--jd' && args[i + 1]) opts.jd = args[++i];
    else if (args[i] === '--resumes' && args[i + 1]) opts.resumes = args[++i];
  }
  return opts;
}

// ---- File reading helpers ----
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function readResumesFromDir(dirPath) {
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.txt') && !f.startsWith('jd'))
    .map((f) => ({
      fileName: f,
      text: readFile(path.join(dirPath, f)),
    }));
}

// ---- Resume parsing pipeline ----
function parseResume(fileName, text) {
  const sections = sectionDetector.splitIntoSections(text);
  const fullText = text;
  const allVariants = skillDictionary.getAllVariants();
  const getCanonical = skillDictionary.getCanonicalSkill.bind(skillDictionary);

  // Detect skills via phrase matching
  const rawSkills = phraseMatcher.findCanonicalSkills(fullText, allVariants, getCanonical);

  // Filter negated skills
  const { confirmed: detectedSkills, negated: negatedSkills } =
    negativeContextDetector.filterNegatedSkills(rawSkills, fullText);

  // Extract experience and education
  const detectedExperienceYears = experienceExtractor.extractYearsOfExperience(
    sections.experience || fullText
  );
  const detectedEducation = educationExtractor.extractEducationLevel(
    sections.education || fullText
  );

  return {
    fileName,
    rawText: fullText,
    sections,
    detectedSkills,
    negatedSkills,
    detectedExperienceYears,
    detectedEducation,
  };
}

// ---- Display helpers ----
function separator(char = '─', width = 60) {
  return char.repeat(width);
}

function printResult(rankedResult) {
  const { rank, fileName, finalScore, recommendation, matchedMandatory, missingMandatory, matchedPreferred, detectedExperienceYears, detectedEducation } = rankedResult;
  const bar = '='.repeat(Math.round(finalScore / 2));
  const empty = ' '.repeat(50 - Math.round(finalScore / 2));

  console.log(`\nRank #${rank} — ${fileName}`);
  console.log(separator());
  console.log(`Score: ${finalScore}%  [${bar}${empty}]`);
  console.log(`Recommendation: ${recommendation}`);
  console.log(`Matched Mandatory: ${matchedMandatory.length > 0 ? matchedMandatory.join(', ') : 'none'}`);
  console.log(`Missing Mandatory: ${missingMandatory && missingMandatory.length > 0 ? missingMandatory.join(', ') : 'none'}`);
  console.log(`Matched Preferred: ${matchedPreferred && matchedPreferred.length > 0 ? matchedPreferred.join(', ') : 'none'}`);
  console.log(`Experience Years: ${detectedExperienceYears || 0}`);
  console.log(`Education Level: ${detectedEducation || 'not detected'}`);
}

// ---- Main ----
function main() {
  const opts = parseArgs();

  if (!opts.jd || !opts.resumes) {
    console.error('Usage: node run.js --jd <jd.txt> --resumes <resumes-dir/>');
    process.exit(1);
  }

  const jdPath = path.resolve(opts.jd);
  const resumesPath = path.resolve(opts.resumes);

  if (!fs.existsSync(jdPath)) {
    console.error(`JD file not found: ${jdPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(resumesPath)) {
    console.error(`Resumes path not found: ${resumesPath}`);
    process.exit(1);
  }

  console.log('\n' + separator('=', 60));
  console.log(' RESUME SCREENING ENGINE — CLI HARNESS');
  console.log(separator('=', 60));

  // 1. Parse JD
  const jdText = readFile(jdPath);
  console.log(`\nJob Description: ${jdPath}`);
  const jdModel = requirementClassifier.classifyJD(jdText);
  console.log(`  Mandatory skills required: ${jdModel.mandatorySkills.join(', ')}`);
  console.log(`  Preferred skills: ${jdModel.preferredSkills.join(', ')}`);
  console.log(`  Min experience: ${jdModel.minExperienceYears} years`);
  console.log(`  Min education: ${jdModel.minEducation || 'not specified'}`);

  // 2. Load and parse resumes
  console.log(`\nLoading resumes from: ${resumesPath}`);
  const resumeFiles = readResumesFromDir(resumesPath);
  console.log(`  Found ${resumeFiles.length} resume(s)`);

  if (resumeFiles.length === 0) {
    console.log('No resume .txt files found. Exiting.');
    process.exit(0);
  }

  // 3. Score each resume
  const scoreResults = resumeFiles.map(({ fileName, text }) => {
    const resumeModel = parseResume(fileName, text);
    const score = scoringEngine.calculateScores(jdModel, resumeModel);
    const report = reportGenerator.generateReport(score);
    return {
      ...score,
      recommendation: report.recommendation,
      detectedExperienceYears: resumeModel.detectedExperienceYears,
      detectedEducation: resumeModel.detectedEducation,
    };
  });

  // 4. Rank candidates
  const ranked = rankingEngine.rankCandidates(scoreResults);

  // 5. Print results
  console.log('\n' + separator('=', 60));
  console.log(' RANKED CANDIDATES');
  console.log(separator('=', 60));

  for (const result of ranked) {
    printResult(result);
  }

  console.log('\n' + separator('=', 60));
  console.log(' SUMMARY TABLE');
  console.log(separator('=', 60));
  console.log(`${'Rank'.padEnd(6)} ${'File'.padEnd(25)} ${'Score'.padEnd(8)} ${'Recommendation'}`);
  console.log(separator('-', 60));
  for (const r of ranked) {
    console.log(
      `${String(r.rank).padEnd(6)} ${r.fileName.padEnd(25)} ${String(r.finalScore + '%').padEnd(8)} ${r.recommendation}`
    );
  }

  console.log('');
}

main();
