'use strict';

const { splitIntoSections, detectSectionHeading, isHeadingLike } = require('../src/sectionDetector');

const SAMPLE_RESUME = `
John Doe
johndoe@email.com

Summary
Experienced software developer with 5 years of experience in Python and JavaScript.

Skills
Python, JavaScript, React, Node.js, SQL, Docker, Git

Experience
Senior Developer at TechCorp (2020-2024)
Developed REST APIs using Node.js and Python.

Education
B.Tech in Computer Science, State University (2018)

Certifications
AWS Certified Developer
Docker Certified Associate

Projects
Build a ML pipeline using Python and TensorFlow.
`;

describe('splitIntoSections', () => {
  let sections;

  beforeEach(() => {
    sections = splitIntoSections(SAMPLE_RESUME);
  });

  test('returns an object with expected section keys', () => {
    expect(sections).toHaveProperty('summary');
    expect(sections).toHaveProperty('skills');
    expect(sections).toHaveProperty('experience');
    expect(sections).toHaveProperty('education');
    expect(sections).toHaveProperty('certifications');
    expect(sections).toHaveProperty('projects');
  });

  test('puts skill content in skills section', () => {
    expect(sections.skills).toContain('Python');
    expect(sections.skills).toContain('React');
    expect(sections.skills).toContain('Docker');
  });

  test('puts experience content in experience section', () => {
    expect(sections.experience).toContain('TechCorp');
    expect(sections.experience).toContain('Node.js');
  });

  test('puts education content in education section', () => {
    expect(sections.education).toContain('B.Tech');
    expect(sections.education).toContain('Computer Science');
  });

  test('puts certifications in certifications section', () => {
    expect(sections.certifications).toContain('AWS');
    expect(sections.certifications).toContain('Docker');
  });

  test('handles empty input', () => {
    const result = splitIntoSections('');
    expect(result.skills).toBe('');
    expect(result.experience).toBe('');
  });

  test('handles varied heading styles', () => {
    const resume = 'Technical Skills\nPython, Docker\nWork Experience\n3 years at XYZ Corp';
    const r = splitIntoSections(resume);
    expect(r.skills).toContain('Python');
    expect(r.experience).toContain('XYZ Corp');
  });
});

describe('detectSectionHeading', () => {
  test('detects "skills" heading', () => {
    expect(detectSectionHeading('Skills')).toBe('skills');
    expect(detectSectionHeading('Technical Skills')).toBe('skills');
    expect(detectSectionHeading('SKILLS')).toBe('skills');
  });
  test('detects "experience" heading variants', () => {
    expect(detectSectionHeading('Work Experience')).toBe('experience');
    expect(detectSectionHeading('Professional Experience')).toBe('experience');
    expect(detectSectionHeading('Experience')).toBe('experience');
  });
  test('detects "education" heading', () => {
    expect(detectSectionHeading('Education')).toBe('education');
    expect(detectSectionHeading('Academic Background')).toBe('education');
  });
  test('returns null for non-heading text', () => {
    expect(detectSectionHeading('I worked at Google')).toBeNull();
  });
});

describe('isHeadingLike', () => {
  test('short line without period is heading-like', () => {
    expect(isHeadingLike('Skills')).toBe(true);
    expect(isHeadingLike('Work Experience')).toBe(true);
  });
  test('long sentence is not heading-like', () => {
    expect(isHeadingLike('I am a skilled Python developer with 5 years of experience in backend development.')).toBe(false);
  });
  test('bullet points are not heading-like', () => {
    expect(isHeadingLike('- Developed REST APIs')).toBe(false);
    expect(isHeadingLike('• Led a team of 5 engineers')).toBe(false);
  });
});
