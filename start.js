'use strict';

/**
 * start.js — Launches backend + frontend together in one terminal process.
 * Run: node start.js
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT = __dirname;

const servers = [
  {
    name: 'BACKEND ',
    color: '\x1b[35m',   // magenta
    cwd: path.join(ROOT, 'backend'),
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
  },
  {
    name: 'FRONTEND',
    color: '\x1b[36m',   // cyan
    cwd: path.join(ROOT, 'frontend'),
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
  },
];

const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';
const GREEN = '\x1b[32m';

console.log(`\n${BOLD}${GREEN}╔════════════════════════════════════════════╗${RESET}`);
console.log(`${BOLD}${GREEN}║   Scorivia — Starting All Servers           ║${RESET}`);
console.log(`${BOLD}${GREEN}╚════════════════════════════════════════════╝${RESET}\n`);

const procs = [];

for (const s of servers) {
  const proc = spawn(s.cmd, s.args, {
    cwd: s.cwd,
    shell: true,
    env: { ...process.env },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      console.log(`${s.color}[${s.name}]${RESET} ${line}`);
    }
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      console.log(`${s.color}[${s.name}]${RESET} \x1b[33m${line}${RESET}`);
    }
  });

  proc.on('close', (code) => {
    console.log(`\x1b[31m[${s.name}] Process exited with code ${code}\x1b[0m`);
  });

  procs.push(proc);
}

// Graceful shutdown on Ctrl+C / SIGINT / SIGTERM
const shutdown = () => {
  console.log('\n\x1b[33mShutting down all servers...\x1b[0m');
  procs.forEach((p) => p.kill('SIGTERM'));
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`${BOLD}Both servers starting...${RESET}`);
console.log(`  → Backend  API : http://localhost:3001`);
console.log(`  → Frontend App : http://localhost:5173\n`);
