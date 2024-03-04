import {type IModel, measure, model} from 'makerjs';
import {type Config} from '@schema';
import {brookStandoff} from '@parts/brook';
import {dxfLayerOptions, svgLayerOptions} from '@helpers/color';
import {type ModelTree} from './model';

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

  line = [leftSidePlate, rightSidePlate];
  printLine('sidePlatesX');

  const backSidePlate = model.clone(tree.models.sidePlates.models.back);

  const frontSidePlate = model.clone(tree.models.sidePlates.models.front);

  line = [backSidePlate, frontSidePlate];
  printLine('sidePlatesY');

  const bottomPlate = model.clone(tree.models.bottomPlate);

  line = [bottomPlate];
  printLine('bottomPlate');

  const topPlate = model.clone(tree.models.topPlate);

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

  m.exporterOptions = {
    toDXF: { // eslint-disable-line @typescript-eslint/naming-convention
      layerOptions: dxfLayerOptions,
    },
    toSVG: { // eslint-disable-line @typescript-eslint/naming-convention
      layerOptions: svgLayerOptions,
    },
  };

  console.log('cadModelTree', m);

  return m;
}
