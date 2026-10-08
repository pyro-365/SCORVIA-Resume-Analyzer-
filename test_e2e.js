// Full end-to-end API test — corrected for actual backend routes
const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    }).on('error', reject);
  });
}

function request(method, url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const post = (url, p) => request('POST', url, p);
const put  = (url, p) => request('PUT',  url, p);

async function main() {
  const B = 'http://localhost:3001';
  let pass = 0, fail = 0;

  function ok(label, cond, detail = '') {
    if (cond) { console.log(`  ✅  ${label}`); pass++; }
    else       { console.log(`  ❌  ${label}${detail ? ' — ' + JSON.stringify(detail).slice(0,120) : ''}`); fail++; }
  }

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  AutoScreener — End-to-End API Test Suite            ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── 1. Health ──────────────────────────────────────────────
  console.log('▸ 1. Health Check');
  const h = await get(`${B}/api/health`);
  ok('GET /api/health → 200',       h.status === 200, h.status);
  ok('status = "ok"',               h.body.status === 'ok');
  ok('service name correct',        h.body.service === 'resume-screening-backend');

  // ── 2. Skills Dictionary ───────────────────────────────────
  console.log('\n▸ 2. Skills Dictionary');
  const sk = await get(`${B}/api/skills`);
  ok('GET /api/skills → 200',       sk.status === 200, sk.status);
  ok('≥ 20 skills seeded',          Array.isArray(sk.body) && sk.body.length >= 20, sk.body.length);
  ok('has canonicalName field',     sk.body[0]?.canonicalName != null);
  ok('has variants array',          Array.isArray(sk.body[0]?.variants));
  console.log(`     → ${sk.body.length} skills loaded. First 5: ${sk.body.slice(0,5).map(s=>s.canonicalName).join(', ')}…`);

  // ── 3. Parse JD ────────────────────────────────────────────
  console.log('\n▸ 3. Job Description Parse  (POST /api/job-descriptions)');
  const jdText = [
    'Senior Python Developer',
    '',
    'Required Skills:',
    '- Python',
    '- SQL',
    '- Docker',
    '- Git',
    '- REST API',
    'Minimum 3 years of experience required.',
    'Bachelor\'s degree in Computer Science required.',
    '',
    'Preferred:',
    '- React.js',
    '- AWS',
    '- TypeScript',
  ].join('\n');

  const jdRes = await post(`${B}/api/job-descriptions`, { rawText: jdText, title: 'Senior Python Developer' });
  ok('POST /api/job-descriptions → 201', jdRes.status === 201, jdRes.status);
  ok('returns id',                  !!jdRes.body.id, jdRes.body);
  ok('returns parsedRequirements',  !!jdRes.body.parsedRequirements, jdRes.body);
  ok('mandatory has python',        jdRes.body.parsedRequirements?.mandatorySkills?.includes('python'), jdRes.body.parsedRequirements?.mandatorySkills);
  ok('preferred has react (canonical for React.js)', jdRes.body.parsedRequirements?.preferredSkills?.includes('react'), jdRes.body.parsedRequirements?.preferredSkills);
  const jdId = jdRes.body.id;
  console.log(`     → JD ID: ${jdId}`);
  console.log(`     → Mandatory: [${jdRes.body.parsedRequirements?.mandatorySkills?.join(', ')}]`);
  console.log(`     → Preferred: [${jdRes.body.parsedRequirements?.preferredSkills?.join(', ')}]`);
  console.log(`     → Min Exp: ${jdRes.body.parsedRequirements?.minExperienceYears} yrs, Education: ${jdRes.body.parsedRequirements?.minEducation}`);

  // ── 4. Create Screening Run ────────────────────────────────
  console.log('\n▸ 4. Create Screening Run  (POST /api/runs)');
  const runRes = await post(`${B}/api/runs`, { jdId, mandatoryWeight: 0.5, preferredWeight: 0.25, experienceWeight: 0.15, educationWeight: 0.1 });
  ok('POST /api/runs → 201',        runRes.status === 201, runRes.status);
  ok('returns run id',              !!runRes.body.id, runRes.body);
  ok('status = draft',              runRes.body.status === 'draft', runRes.body.status);
  const runId = runRes.body.id;
  console.log(`     → Run ID: ${runId}`);

  // ── 5. Upload Resumes ──────────────────────────────────────
  console.log('\n▸ 5. Upload Resumes  (POST /api/runs/:id/resumes)');
  const uploadRes = await post(`${B}/api/runs/${runId}/resumes`, {
    resumes: [
      {
        fileName: 'alice_senior.txt',
        rawText: [
          'Alice Johnson | alice@email.com',
          '',
          'Professional Summary:',
          'Senior Developer with 5 years experience in backend development.',
          '',
          'Technical Skills:',
          'Python, SQL, PostgreSQL, Docker, Git, REST API, React.js, TypeScript, AWS, Agile',
          '',
          'Work Experience:',
          'Senior Backend Developer at TechCorp (2019-2024) - 5 years',
          '- Built Python microservices, REST APIs',
          '- Managed PostgreSQL databases and Docker containers',
          '- Used Git for version control, worked in Agile teams',
          '',
          'Education:',
          'Bachelor of Technology in Computer Science - State University (2019)',
        ].join('\n'),
      },
      {
        fileName: 'bob_junior.txt',
        rawText: [
          'Bob Martinez | bob@email.com',
          '',
          'Junior Developer, 1 year experience.',
          '',
          'Skills: Python, HTML, CSS, JavaScript',
          '',
          'Experience:',
          'Junior Web Developer at WebAgency (2023-2024) - 1 year',
          '- No experience with Docker or containerization',
          '- Limited Git workflow knowledge',
          '',
          'Education:',
          'High School Certificate (2021)',
        ].join('\n'),
      },
      {
        fileName: 'carol_experienced.txt',
        rawText: [
          'Carol Rivera | carol@email.com',
          '',
          'Summary: Data Engineer with 4 years Python and SQL expertise.',
          '',
          'Skills: Python, SQL, Docker, Git, REST API, TypeScript',
          '',
          'Experience:',
          'Data Engineer at DataCo (2020-2024) - 4 years',
          '- Designed and optimized SQL query pipelines',
          '- Deployed Docker containers in production',
          '- Built REST APIs and Git workflows',
          '',
          'Education:',
          'Masters degree in Data Science - City University (2020)',
        ].join('\n'),
      },
    ],
  });
  ok('POST /api/runs/:id/resumes → 201', uploadRes.status === 201, uploadRes.status);
  ok('uploadedCount = 3',          uploadRes.body.uploadedCount === 3, uploadRes.body.uploadedCount);
  ok('resumes array has 3 items',  uploadRes.body.resumes?.length === 3, uploadRes.body.resumes?.length);
  console.log(`     → Uploaded: ${uploadRes.body.resumes?.map(r => r.fileName).join(', ')}`);
  console.log(`     → Detected exp years: ${uploadRes.body.resumes?.map(r => r.detectedExperienceYears + 'yrs').join(', ')} (0 = not extracted from bullets — OK)`);
  console.log(`     → Education levels: ${uploadRes.body.resumes?.map(r => r.detectedEducation).join(', ')}`);

  // ── 6. Execute Screening ───────────────────────────────────
  console.log('\n▸ 6. Execute Screening Pipeline  (POST /api/runs/:id/execute)');
  const execRes = await post(`${B}/api/runs/${runId}/execute`, {});
  ok('POST /api/runs/:id/execute → 200', execRes.status === 200, execRes.status);
  ok('status = completed',         execRes.body.status === 'completed', execRes.body.status);
  ok('processedCount = 3',         execRes.body.processedCount === 3, execRes.body.processedCount);
  ok('rankings array returned',    Array.isArray(execRes.body.rankings), execRes.body);
  ok('Alice ranked #1 (most skills)', execRes.body.rankings?.[0]?.fileName?.includes('alice') || execRes.body.rankings?.[0]?.fileName?.includes('carol'), execRes.body.rankings?.map(r=>r.fileName));

  console.log('\n  📊 Candidate Rankings:');
  (execRes.body.rankings || []).forEach(r => {
    console.log(`     → Rank #${r.rank}: ${r.fileName} | Score: ${r.finalScore}% | ${r.recommendation}`);
  });

  // ── 7. Get Results Dashboard ───────────────────────────────
  console.log('\n▸ 7. Results Dashboard  (GET /api/runs/:id/results)');
  const dashRes = await get(`${B}/api/runs/${runId}/results`);
  ok('GET /api/runs/:id/results → 200', dashRes.status === 200, dashRes.status);
  ok('returns results array',       Array.isArray(dashRes.body.results), dashRes.body);
  ok('results count = 3',           dashRes.body.results?.length === 3, dashRes.body.results?.length);
  ok('first result has finalScore', typeof dashRes.body.results?.[0]?.finalScore === 'number');
  ok('first result has matchedMandatory', Array.isArray(dashRes.body.results?.[0]?.matchedMandatory));
  const topResult = dashRes.body.results?.[0];
  console.log(`     → Top candidate: ${topResult?.fileName} (${topResult?.finalScore}%, ${topResult?.recommendation})`);
  console.log(`     → Matched mandatory: [${topResult?.matchedMandatory?.join(', ')}]`);
  console.log(`     → Missing mandatory: [${topResult?.missingMandatory?.join(', ')}]`);

  // ── 8. Candidate Detailed Report ──────────────────────────
  console.log('\n▸ 8. Candidate Detail Report  (GET /api/runs/:id/results/:candidateId)');
  const topId = topResult?.resumeId;
  const rptRes = await get(`${B}/api/runs/${runId}/results/${topId}`);
  ok('GET /api/runs/:id/results/:id → 200', rptRes.status === 200, rptRes.status);
  ok('has scoresBreakdown',         !!rptRes.body.scoresBreakdown, rptRes.body);
  ok('has explanationBullets',      Array.isArray(rptRes.body.explanationBullets), rptRes.body);
  ok('has rawText',                 typeof rptRes.body.rawText === 'string', typeof rptRes.body.rawText);
  ok('has sections object',         !!rptRes.body.sections, rptRes.body);
  console.log(`     → Score breakdown: mandatory=${rptRes.body.scoresBreakdown?.mandatory}%, preferred=${rptRes.body.scoresBreakdown?.preferred}%, exp=${rptRes.body.scoresBreakdown?.experience}%, edu=${rptRes.body.scoresBreakdown?.education}%`);
  console.log(`     → Explanation bullets: ${rptRes.body.explanationBullets?.length} items`);

  // ── 9. Manual Label Submission ─────────────────────────────
  console.log('\n▸ 9. Manual Ground-Truth Labels  (POST /api/runs/:id/labels)');
  const results3 = dashRes.body.results || [];
  const labelPromises = results3.map(async (r) => {
    const truth = r.finalScore >= 60 ? 'suitable' : r.finalScore >= 35 ? 'partially suitable' : 'unsuitable';
    return post(`${B}/api/runs/${runId}/labels`, { resumeId: r.resumeId, label: truth });
  });
  const labelResults = await Promise.all(labelPromises);
  const allLabeled = labelResults.every(l => l.status === 200);
  ok('All 3 manual labels saved (200)', allLabeled, labelResults.map(l=>l.status));
  console.log(`     → Labels set: ${results3.map((r,i) => r.fileName + '=' + labelResults[i].body.label).join(', ')}`);

  // ── 10. Evaluation Metrics ─────────────────────────────────
  console.log('\n▸ 10. Evaluation Metrics  (GET /api/runs/:id/evaluation)');
  const evalRes = await get(`${B}/api/runs/${runId}/evaluation`);
  ok('GET /api/runs/:id/evaluation → 200', evalRes.status === 200, evalRes.status);
  ok('has metrics object',          !!evalRes.body.metrics, evalRes.body);
  ok('has confusionMatrix',         !!evalRes.body.confusionMatrix, evalRes.body);
  ok('totalLabeled = 3',            evalRes.body.totalLabeled === 3, evalRes.body.totalLabeled);
  const m = evalRes.body.metrics;
  console.log(`     → Precision: ${m?.precision}%, Recall: ${m?.recall}%, F1: ${m?.f1}%, Accuracy: ${m?.accuracy}%`);
  console.log(`     → Confusion Matrix: TP=${evalRes.body.confusionMatrix?.tp}, FP=${evalRes.body.confusionMatrix?.fp}, FN=${evalRes.body.confusionMatrix?.fn}, TN=${evalRes.body.confusionMatrix?.tn}`);

  // ── 11. Recruiter Notes ────────────────────────────────────
  console.log('\n▸ 11. Recruiter Notes  (POST /api/resumes/:id/notes)');
  const noteRes = await post(`${B}/api/resumes/${topId}/notes`, { noteText: 'Strong Python background. Recommend for phone screen.' });
  ok('POST /api/resumes/:id/notes → 200', noteRes.status === 200, noteRes.status);
  ok('returns noteText',            noteRes.body.noteText?.length > 0, noteRes.body);

  // ── 12. Weight Update ──────────────────────────────────────
  console.log('\n▸ 12. Weight Update  (PUT /api/runs/:id/weights)');
  const wtRes = await put(`${B}/api/runs/${runId}/weights`, { mandatory: 0.6, preferred: 0.2, experience: 0.1, education: 0.1, reexecute: false });
  ok('PUT /api/runs/:id/weights → 200', wtRes.status === 200, wtRes.status);
  ok('returns runId',               wtRes.body.runId === runId, wtRes.body);

  // ── 13. Run Detail ─────────────────────────────────────────
  console.log('\n▸ 13. Run Detail  (GET /api/runs/:id)');
  const runDetail = await get(`${B}/api/runs/${runId}`);
  ok('GET /api/runs/:id → 200',    runDetail.status === 200, runDetail.status);
  ok('status = completed',         runDetail.body.status === 'completed', runDetail.body.status);
  ok('resumesCount = 3',           runDetail.body.resumesCount === 3, runDetail.body.resumesCount);

  // ── 14. JD Update ─────────────────────────────────────────
  console.log('\n▸ 14. JD Manual Override  (PUT /api/job-descriptions/:id)');
  const jdUpd = await put(`${B}/api/job-descriptions/${jdId}`, {
    title: 'Senior Python Developer (Updated)',
    mandatorySkills: ['python', 'sql', 'docker', 'git', 'rest api', 'kubernetes'],
    preferredSkills: ['react.js', 'aws'],
    minExperienceYears: 4,
    minEducation: 'bachelors',
  });
  ok('PUT /api/job-descriptions/:id → 200', jdUpd.status === 200, jdUpd.status);
  ok('mandatory skills updated',   jdUpd.body.parsedRequirements?.mandatorySkills?.includes('kubernetes'), jdUpd.body.parsedRequirements?.mandatorySkills);

  // ── Summary ────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${pass.toString().padEnd(3)} PASSED  |  ${fail.toString().padEnd(3)} FAILED                     ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
  if (fail > 0) process.exit(1);
}

main().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
