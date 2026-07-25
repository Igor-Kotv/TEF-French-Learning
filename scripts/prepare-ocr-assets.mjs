import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(
  appRoot,
  'node_modules/@tesseract.js-data/fra/4.0.0_best_int/fra.traineddata.gz',
);
const target = resolve(appRoot, 'public/ocr/lang/fra.traineddata.gz');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
