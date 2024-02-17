import {type IPoint, model, paths, type IModel} from 'makerjs';
import {screwHoles} from '@fasteners/screw';

type StickDrawOptions = {
  point: IPoint;
  isClearPlate: boolean;
};

type SticksDrawOptions = {
  points: IPoint[];
  isClearPlate: boolean;
};

const w = 40;
const h = 85;

const mountingHoles = [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
];

export function stick({point, isClearPlate}: StickDrawOptions) {
  const m = {
    paths: {
      stickHole: new paths.Circle(12),
    },
  };

  if (!isClearPlate) {
    model.addModel(m, {
      ...screwHoles({points: mountingHoles, size: 'm4'}),
      origin: [-w / 2, -h / 2],
    }, 'm4');
  }

  model.move(m, point);

  return m;
}

export function sticks({points, isClearPlate}: SticksDrawOptions) {
  const sticks: IModel & {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, point] of points.entries()) {
    const b = stick({point, isClearPlate});
    sticks.models[`stick${i}`] = b;
  }

  return sticks;
}
