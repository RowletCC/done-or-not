#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { assess } from '../docs/assess.js';
const path = process.argv[2];
if (!path || process.argv.length !== 3) {
  console.error('Usage: node bin/check.mjs path/to/export-trace.json');
  process.exitCode = 2;
} else {
  try {
    const verdict = assess(JSON.parse(await readFile(path, 'utf8')));
    console.log(JSON.stringify(verdict, null, 2));
    process.exitCode = verdict.status === 'completed' ? 0 : 1;
  } catch (error) {
    console.error(`Cannot read trace: ${error.message}`);
    process.exitCode = 2;
  }
}
