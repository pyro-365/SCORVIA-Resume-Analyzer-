'use strict';

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/server');
const { resetDb } = require('../src/db/seed');

const samplesDir = path.join(__dirname, '../../engine/cli/samples');
const jdText = fs.readFileSync(path.join(samplesDir, 'jd.txt'), 'utf-8');
const resume1Text = fs.readFileSync(path.join(samplesDir, 'resume_01.txt'), 'utf-8');
const resume2Text = fs.readFileSync(path.join(samplesDir, 'resume_02.txt'), 'utf-8');
const resume3Text = fs.readFileSync(path.join(samplesDir, 'resume_03.txt'), 'utf-8');

beforeAll(() => {
  resetDb();
});

describe('Backend API End-to-End Integration Flow', () => {
  let jdId;
  let runId;
  let candidate1Id;

  test('GET /api/health returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/job-descriptions creates and parses JD', async () => {
    const res = await request(app)
      .post('/api/job-descriptions')
      .send({ title: 'Senior Developer', rawText: jdText });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.parsedRequirements.mandatorySkills).toContain('python');
    expect(res.body.parsedRequirements.minExperienceYears).toBe(3);
    jdId = res.body.id;
  });

  test('GET /api/job-descriptions/:id returns JD details', async () => {
    const res = await request(app).get(`/api/job-descriptions/${jdId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Senior Developer');
  });

  test('GET /api/skills returns default seeded skill dictionary', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(30);
  });

  test('POST /api/runs creates a screening run', async () => {
    const res = await request(app)
      .post('/api/runs')
      .send({ jdId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('draft');
    runId = res.body.id;
  });

  test('POST /api/runs/:id/resumes adds sample resumes', async () => {
    const res = await request(app)
      .post(`/api/runs/${runId}/resumes`)
      .send({
        resumes: [
          { fileName: 'resume_01.txt', rawText: resume1Text },
          { fileName: 'resume_02.txt', rawText: resume2Text },
          { fileName: 'resume_03.txt', rawText: resume3Text },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.uploadedCount).toBe(3);
  });

  test('POST /api/runs/:id/execute runs full engine and matches CLI output', async () => {
    const res = await request(app).post(`/api/runs/${runId}/execute`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.processedCount).toBe(3);

    const rankings = res.body.rankings;
    expect(rankings[0].fileName).toBe('resume_01.txt');
    expect(rankings[0].recommendation).toBe('Suitable');

    expect(rankings[1].fileName).toBe('resume_02.txt');
    expect(rankings[1].recommendation).toBe('Partially suitable');

    expect(rankings[2].fileName).toBe('resume_03.txt');
    expect(rankings[2].recommendation).toBe('Not suitable');

    candidate1Id = rankings[0].resumeId;
  });

  test('GET /api/runs/:id/results fetches ranked results', async () => {
    const res = await request(app).get(`/api/runs/${runId}/results`);

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBe(3);
    expect(res.body.results[0].fileName).toBe('resume_01.txt');
    expect(res.body.results[0].matchedMandatory).toContain('python');
  });

  test('GET /api/runs/:id/results/:candidateId returns full report card', async () => {
    const res = await request(app).get(`/api/runs/${runId}/results/${candidate1Id}`);

    expect(res.status).toBe(200);
    expect(res.body.fileName).toBe('resume_01.txt');
    expect(res.body.explanationBullets.length).toBeGreaterThan(0);
    expect(res.body.rawText).toContain('Alice Johnson');
  });

  test('POST /api/runs/:id/labels submits manual labels and GET evaluation metrics computes Precision/Recall/F1', async () => {
    // Label candidate 1 suitable, candidate 2 partially suitable, candidate 3 unsuitable
    await request(app).post(`/api/runs/${runId}/labels`).send({ resumeId: candidate1Id, label: 'suitable' });

    const evalRes = await request(app).get(`/api/runs/${runId}/evaluation`);

    expect(evalRes.status).toBe(200);
    expect(evalRes.body.totalLabeled).toBe(1);
    expect(evalRes.body.metrics).toHaveProperty('precision');
    expect(evalRes.body.metrics).toHaveProperty('f1');
  });
});
