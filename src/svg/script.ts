// There is a bug that tsx does not work with node 20, see if below pr works after it is merged
// Workaround: remove type: "module" in package.json to run this script
// https://github.com/privatenumber/tsx/issues/38
// https://github.com/specify/specify7/pull/4558

import {presets} from '@presets';
import {buildModelTree, previewModelTree} from '@tree';
import {exporter} from 'makerjs';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

for (const preset of presets) {
  const {tree} = buildModelTree(preset.config);
  const previewTree = previewModelTree(tree);
  const svg = exporter.toSVG(previewTree);
  const outputPath = path.join(__dirname, `${preset.id}.svg`);
  fs.writeFileSync(outputPath, svg);
}
