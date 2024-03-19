import {type IModel, model, models, paths, type IPoint} from 'makerjs';

type Button = {
  holeRadius: number;
  outerRadius: number;
};

export type ButtonType = 'obsf24' | 'obsf30';

const obsf24: Button = {
  outerRadius: 27.2 / 2,
  holeRadius: 24 / 2,
};

const obsf30: Button = {
  holeRadius: 30 / 2,
  outerRadius: 33.2 / 2,
};

export const buttonSpec: Record<ButtonType, Button> = {
  obsf24,
  obsf30,
};

type ButtonOptions = {
  size: ButtonType;
  isClearPlate: boolean;
  isAboveClearPlate: boolean;
};

function button({size, isClearPlate, isAboveClearPlate}: ButtonOptions) {
  const {holeRadius: ir, outerRadius: or} = buttonSpec[size];

  const hole: IModel = {
    paths: {
      circle: new paths.Circle([0, 0], ir),
    },
  };

  const outer: IModel = {
    paths: {
      // 1mm for clearance
      circle: new paths.Circle([0, 0], or + 1),
    },
  };

  if (isClearPlate) {
    return isAboveClearPlate ? hole : outer;
  }

  const slotLength = (3 + ir) * 2;

  const slot = {
    ...new models.Rectangle(7, slotLength),
    origin: [-7 / 2, -slotLength / 2],
  };

  // Rotate 20 degree should avoid the slot collided with other slot in most layout
  model.rotate(slot, 20);

  return model.combineUnion(model.clone(slot), model.clone(hole));
}

type DrawOptions = {
  points: IPoint[];
  size: ButtonType;
  isClearPlate: boolean;
  isAboveClearPlate: boolean;
};

export function buttons({points, size, isClearPlate, isAboveClearPlate}: DrawOptions) {
  const buttonHoles: IModel & {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, point] of points.entries()) {
    const b = button({size, isClearPlate, isAboveClearPlate});
    model.move(b, point);
    buttonHoles.models[`buttonHole${i}`] = b;
  }

  return buttonHoles;
}
