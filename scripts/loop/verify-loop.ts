import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const LOG_PATH = resolve(REPO_ROOT, 'verify.log');

interface RunResult {
  ok: boolean;
  violations: number;
  rawOutput: string;
  exitCode: number;
}

function parseViolations(output: string): number {
  // run-all.ts prints e.g. "3 violation(s) across 3 check(s).".
  const m = output.match(/(\d+)\s+violation\(s\)/);
  if (m) return Number(m[1]);
  // Fallback: count FAIL lines.
  return (output.match(/^FAIL\s/gm) ?? []).length;
}

function runVerify(): RunResult {
  const result = spawnSync(
    process.execPath,
    ['scripts/verify/run-all.ts'],
    { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const rawOutput = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const exitCode = result.status ?? 1;
  const ok = exitCode === 0;
  const violations = ok ? 0 : parseViolations(rawOutput);
  return { ok, violations, rawOutput, exitCode };
}

function appendLogLine(line: string): void {
  // OS line terminator so the file opens cleanly in any editor on
  // Windows or POSIX.
  appendFileSync(LOG_PATH, `${line}\n`, { encoding: 'utf8' });
}

function main(): number {
  const ts = new Date().toISOString();
  const result = runVerify();
  if (result.ok) {
    appendLogLine(`${ts} PASS`);
    console.log(`[verify-loop] PASS (logged to ${LOG_PATH})`);
    return 0;
  }
  appendLogLine(`${ts} FAIL  ${result.violations}`);
  console.log(
    `[verify-loop] FAIL ${result.violations} violation(s) (logged to ${LOG_PATH})`,
  );
  // Print upstream output so the operator sees what failed without
  // tailing a separate log.
  process.stdout.write(result.rawOutput);
  return result.exitCode;
}

process.exit(main());
