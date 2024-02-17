import {LayerColor} from '@helpers/color';
import {type IPoint, point, model, paths, path, type IModel} from 'makerjs';
import {screwHoles} from '@fasteners/screw';

type BrookDrawOptions = {
  point: IPoint;
};

type BrooksDrawOptions = {
  points: IPoint[];
};

const pcbSize = [96.0122, 45.0091];

const brookHoles = [
  [0, 0],
  [87.71, 36.96],
  [87.71, 0],
  [0, 36.96],
];

function brook({point}: BrookDrawOptions) {
  const m4 = screwHoles({points: brookHoles, size: 'm4'});
  model.move(m4, point);
  m4.layer = LayerColor.orange;
  return m4;
}

export function brookPcbsMountingHoles({points}: BrooksDrawOptions) {
  const brookPcbsMountingHoles: IModel & {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, point] of points.entries()) {
    const b = brook({point});
    brookPcbsMountingHoles.models[`brookPcbsMountingHoles${i}`] = b;
  }

  return brookPcbsMountingHoles;
}

export function brookStandoff(options: BrookDrawOptions) {
  const ptLeftBottom = brookHoles[0];
  const ptLeftTop = brookHoles[3];
  const ptRightTop = brookHoles[1];
  const ptRightBottom = brookHoles[2];

  const safeArea = Math.max((pcbSize[0] - ptRightTop[0]) / 2, (pcbSize[1] - ptRightTop[1]) / 2) + 3;
  const strokeWidth = 10;

  const dist = safeArea + (strokeWidth / 2);

  const offsetPtLeftTop = point.add(ptLeftTop, [-dist, dist]);
  const offsetPtRightTop = point.add(ptRightTop, [dist, dist]);
  const offsetPtLeftBottom = point.add(ptLeftBottom, [-dist, -dist]);
  const offsetPtRightBottom = point.add(ptRightBottom, [dist, -dist]);

  const left = new paths.Line(offsetPtLeftBottom, offsetPtLeftTop);
  const right = new paths.Line(offsetPtRightBottom, offsetPtRightTop);
  const bottom = new paths.Line(offsetPtLeftBottom, offsetPtRightBottom);

  const screwSupportLeftTop = new paths.Line(ptLeftTop, offsetPtLeftTop);
  const screwSupportRightTop = new paths.Line(ptRightTop, offsetPtRightTop);
  const screwSupportLeftBottom = new paths.Line(ptLeftBottom, offsetPtLeftBottom);
  const screwSupportRightBottom = new paths.Line(ptRightBottom, offsetPtRightBottom);

  let m = {};

  m = model.combineUnion(path.expand(left, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(right, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(bottom, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(screwSupportLeftTop, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(screwSupportRightTop, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(screwSupportLeftBottom, strokeWidth / 2), m);
  m = model.combineUnion(path.expand(screwSupportRightBottom, strokeWidth / 2), m);

  model.addModel(m, screwHoles({points: brookHoles, size: 'm4'}), 'holes');

  model.move(m, options.point);

  return m;
}
