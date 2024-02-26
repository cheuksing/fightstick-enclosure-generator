import DxfParser from 'dxf-parser';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layoutName = 'button';
const folder = 'split-shiokenstar-with-extra-button';

async function parseDxfFile(filePath) {
  const parser = new DxfParser();

  try {
    const dxfContents = await fs.readFile(filePath, 'utf8');
    const parsedDxf = parser.parseSync(dxfContents);

    // Filter entities by layer and type
    const circles = parsedDxf.entities.filter(entity =>
      entity.type === 'CIRCLE' && entity.layer === layoutName,
    );

    // Extract and print center and radius
    for (const circle of circles) {
      const center = circle.center;
      const x = Number(center.x.toFixed(2));
      const y = Number(center.y.toFixed(2));
      const radius = circle.radius;

      if (radius === 12) {
        result.push({x, y, t: 'obsf24'});
      }

      if (radius === 15) {
        result.push({x, y, t: 'obsf30'});
      }
    }
  } catch (error) {
    console.error(error);
  }
}

const dxfPath = path.join(__dirname, folder, 'layout.dxf');

console.log(`Parsing layouts/${folder}/layout.dxf...`);

const result = [];

await parseDxfFile(dxfPath);

const tsPath = path.join(__dirname, folder, 'index.ts');

const template = `
import {type Layout} from '@schema';

export const buttonLayout: Layout = ${JSON.stringify(result, null, 2)};
`;

await fs.writeFile(tsPath, template, 'utf8');

console.log(`Generated layouts/${folder}/index.ts`);
