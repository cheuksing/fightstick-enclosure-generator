import {corners} from '@parts/corner';
import {clearPlate} from '@parts/clear-plate';
import {sidePlates} from '@parts/side-plate';
import {bottomPlate} from '@parts/bottom-plate';
import {topPlate} from '@parts/top-plate';
import {type IModel, measure, model} from 'makerjs';
import {setConfig} from '@config';
import {type Config} from '@schema';
import {brookStandoff} from '@parts/brook';
import {LayerColor} from '@helpers/color';

export function buildModelTree(config: Config) {
  setConfig(config); // Compute config

  const model = {
    models: {
      corners: corners(),
      sidePlates: sidePlates(),
      clearPlate: clearPlate(),
      topPlate: topPlate(),
      bottomPlate: bottomPlate(),
    },
  };

  console.log('buildModelTree', model);

  return model;
}

export type ModelTree = ReturnType<typeof buildModelTree>;

export function previewModelTree(tree: ModelTree) {
  return tree;
}

export function cadModelTree(tree: ModelTree, config: Config) {
  const m: IModel = {};

  let line: IModel[] = [];
  let currX = 0;
  let currY = 0;

  const printLine = (name: string) => {
    const gap = 20;
    const lineStartY = currY;
    let idx = 0;

    for (const _lineModel of line) {
      const lineModel = model.clone(_lineModel);
      const {width, height} = measure.modelExtents(lineModel);
      if (height + lineStartY > currY) {
        currY += height;
      }

      const destination = [currX, lineStartY];

      model.zero(lineModel);
      model.moveRelative(lineModel, destination);

      currX = currX + width + gap;

      model.addModel(m, lineModel, `${name}-${idx}`);
      idx++;
    }

    currX = 0;
    currY += gap;
  };

  const corners: Record<string, IModel[]> = {};

  for (const layer in tree.models.corners.models) { // eslint-disable-line guard-for-in
    const layerModel = tree.models.corners.models[layer];

    for (const corner in layerModel.models) { // eslint-disable-line guard-for-in
      const cornerModel = model.clone(layerModel.models[corner]);
      if (!corners[corner]) {
        corners[corner] = [];
      }

      corners[corner].push(cornerModel);
    }
  }

  for (const c in corners) {
    if (corners[c].length > 0) {
      line = corners[c];
      printLine(`standoff-${c}`);
    }
  }

  const leftSidePlate = model.clone(tree.models.sidePlates.models.left);
  const rightSidePlate = model.clone(tree.models.sidePlates.models.right);

  if (leftSidePlate.models?.holes) {
    leftSidePlate.models.holes.layer = LayerColor.red;
  }

  if (rightSidePlate.models?.holes) {
    rightSidePlate.models.holes.layer = LayerColor.red;
  }

  line = [leftSidePlate, rightSidePlate];
  printLine('sidePlatesX');

  const backSidePlate = model.clone(tree.models.sidePlates.models.back);

  if (backSidePlate.models?.holes) {
    backSidePlate.models.holes.layer = LayerColor.red;
  }

  const frontSidePlate = model.clone(tree.models.sidePlates.models.front);

  if (frontSidePlate.models?.holes) {
    frontSidePlate.models.holes.layer = LayerColor.red;
  }

  line = [backSidePlate, frontSidePlate];
  printLine('sidePlatesY');

  const bottomPlate = model.clone(tree.models.bottomPlate);

  if (bottomPlate.models?.m4) {
    bottomPlate.models.m4.layer = LayerColor.red;
  }

  if (bottomPlate.models?.border) {
    bottomPlate.models.border.layer = LayerColor.fuchsia;
  }

  line = [bottomPlate];
  printLine('bottomPlate');

  const topPlate = model.clone(tree.models.topPlate);

  if (topPlate.models?.m4c) {
    topPlate.models.m4c.layer = LayerColor.red;
  }

  if (topPlate.models?.border) {
    topPlate.models.border.layer = LayerColor.fuchsia;
  }

  line = [topPlate];
  printLine('topPlate');

  const clearPlate = model.clone(tree.models.clearPlate);
  line = [clearPlate];
  printLine('clearPlate');

  if (config.layout.some(({t}) => t === 'brook')) {
    const brookStandoffPlate = brookStandoff({point: [0, 0]});
    line = [brookStandoffPlate];
    printLine('brookStandoffPlate');
  }

  console.log('cadModelTree', m);

  return m;
}
