# Rule-Based Resume Screening System

An offline, deterministic resume-to-job-description matching system.

## Structure

```
resume-builder/
├── engine/      # Shared pure-JS analysis engine (no framework deps)
├── frontend/    # React + Vite UI
├── backend/     # Node + Express API
```

## Quick Start

```bash
# Install all workspaces
npm install

# Run backend
npm run dev:backend

# Run frontend
npm run dev:frontend

# Run engine tests
npm test

# Lint all
npm run lint
```

## Engine CLI

```bash
node engine/cli/run.js --jd engine/cli/samples/jd.txt --resumes engine/cli/samples/
```
