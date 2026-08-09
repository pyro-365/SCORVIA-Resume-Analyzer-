# Rule-Based Resume Screening System

An offline, deterministic resume-to-job-description matching system.

# Demo Video

Youtube Link:https://www.youtube.com/watch?v=zxB7HfeOJdk
Drive Link:https://drive.google.com/file/d/1ffiXXpVG-HSd9mnCA_pdVWgl7GQbQznc/view?usp=drive_link

# Files Link:

ZIP File Drive link:https://drive.google.com/file/d/1uk9HmNNdh9Ah2H-kggcVeqQPRZfNaw-a/view?usp=sharing
File Drive Link:
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
