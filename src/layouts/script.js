import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseDxfFile} from '../utils/parse-dxf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = 'split-shiokenstar-with-extra-button';

const dxfPath = path.join(__dirname, folder, 'layout.dxf');

console.log(`Parsing layouts/${folder}/layout.dxf...`);

const dxfContents = await fs.readFile(dxfPath, 'utf8');
const result = await parseDxfFile(dxfContents.toString());

// Const tsPath = path.join(__dirname, folder, 'index.ts');

// const template = `
// import {type Layout} from '@schema';

// export const buttonLayout: Layout = ${JSON.stringify(result)};
// `;

// await fs.writeFile(tsPath, template, 'utf8');

// console.log(`Generated layouts/${folder}/index.ts`);
