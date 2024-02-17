import {getConfig} from '@config';
import {type IPoint, model, paths} from 'makerjs';

type DrawOptions = {
  point: IPoint;
};

export function neutrik({point}: DrawOptions) {
  const {requriedCornerLayers, plateThickness} = getConfig();

  const sidePlateHeight = requriedCornerLayers * plateThickness;

  // Const w = 26 + 0.1;
  const h = 31 + 0.1;

  const hole1 = new paths.Circle([0, 0], 23.6 / 2);
  const screw1 = new paths.Circle([19 / 2, 24 / 2], 3.1 / 2);
  const screw2 = new paths.Circle([-19 / 2, -24 / 2], 3.1 / 2);

  const m = {
    paths: {
      hole1,
      screw1,
      screw2,
    },
  };

  // 2mm for clearance
  if (h + 2 > sidePlateHeight) {
    model.rotate(m, 90);
  }

  model.moveRelative(m, point);

  return m;
}
