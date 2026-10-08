'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const { seed } = require('./db/seed');

const jobDescriptionsRouter = require('./routes/jobDescriptions');
const skillsRouter = require('./routes/skills');
const runsRouter = require('./routes/runs');
const resultsRouter = require('./routes/results');
const evaluationRouter = require('./routes/evaluation');

const app = express();
const PORT = process.env.PORT || 3001;

// Seed database on startup
try {
  seed();
} catch (err) {
  console.error('[DB Startup Error]', err);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'resume-screening-backend',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/job-descriptions', jobDescriptionsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/runs', runsRouter);
app.use('/api', resultsRouter);
app.use('/api', evaluationRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
