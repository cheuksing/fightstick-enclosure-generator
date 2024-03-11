import {LayerName} from '@helpers/color';
import {point, model, paths, path, type IModel} from 'makerjs';
import {screwHoles} from '@fasteners/screw';

type BrookDrawOptions = {
  x: number;
  y: number;
  r: number;
};

type BrooksDrawOptions = {
  // X, y, r
  points: Array<[number, number, number]>;
};

const pcbSize = [96.0122, 45.0091];

const brookHoles = [
  [0, 0],
  [87.71, 36.96],
  [87.71, 0],
  [0, 36.96],
];

function brook({x, y, r}: BrookDrawOptions) {
  const m3 = screwHoles({points: brookHoles, size: 'm3'});
  model.move(m3, [x, y]);
  m3.layer = LayerName.m3Countersunk;
  model.rotate(m3, r, [x, y]);
  return m3;
}

export function brookPcbsMountingHoles({points}: BrooksDrawOptions) {
  const brookPcbsMountingHoles: IModel & {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, [x, y, r]] of points.entries()) {
    const b = brook({x, y, r});
    brookPcbsMountingHoles.models[`brookPcbsMountingHoles${i}`] = b;
  }

  return brookPcbsMountingHoles;
}

/**
 * Not working. Need redesign
 */
// export function brookStandoff({x, y}: BrookDrawOptions) {
//   const ptLeftBottom = brookHoles[0];
//   const ptLeftTop = brookHoles[3];
//   const ptRightTop = brookHoles[1];
//   const ptRightBottom = brookHoles[2];

//   const safeArea = Math.max((pcbSize[0] - ptRightTop[0]) / 2, (pcbSize[1] - ptRightTop[1]) / 2) + 3;
//   const strokeWidth = 10;

//   const dist = safeArea + (strokeWidth / 2);

//   const offsetPtLeftTop = point.add(ptLeftTop, [-dist, dist]);
//   const offsetPtRightTop = point.add(ptRightTop, [dist, dist]);
//   const offsetPtLeftBottom = point.add(ptLeftBottom, [-dist, -dist]);
//   const offsetPtRightBottom = point.add(ptRightBottom, [dist, -dist]);

//   const left = new paths.Line(offsetPtLeftBottom, offsetPtLeftTop);
//   const right = new paths.Line(offsetPtRightBottom, offsetPtRightTop);
//   const bottom = new paths.Line(offsetPtLeftBottom, offsetPtRightBottom);

//   const screwSupportLeftTop = new paths.Line(ptLeftTop, offsetPtLeftTop);
//   const screwSupportRightTop = new paths.Line(ptRightTop, offsetPtRightTop);
//   const screwSupportLeftBottom = new paths.Line(ptLeftBottom, offsetPtLeftBottom);
//   const screwSupportRightBottom = new paths.Line(ptRightBottom, offsetPtRightBottom);

//   let m = {};

//   m = model.combineUnion(path.expand(left, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(right, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(bottom, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(screwSupportLeftTop, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(screwSupportRightTop, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(screwSupportLeftBottom, strokeWidth / 2), m);
//   m = model.combineUnion(path.expand(screwSupportRightBottom, strokeWidth / 2), m);

//   model.addModel(m, screwHoles({points: brookHoles, size: 'm4'}), 'holes');

//   model.move(m, [x, y]);

//   return m;
// }
