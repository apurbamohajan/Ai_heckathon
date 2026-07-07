import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = readdirSync(__dirname)
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => resolve(__dirname, f));

if (files.length === 0) {
  console.error(`No *.test.ts files found in ${__dirname}`);
  process.exit(1);
}

let failed = 0;
const stream = run({ files, concurrency: true });
stream.on('test:fail', () => {
  failed += 1;
});
stream.compose(new spec()).pipe(process.stdout);
stream.once('end', () => {
  process.exit(failed === 0 ? 0 : 1);
});


void pathToFileURL;
