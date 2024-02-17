import {model, models, type IPoint, type IModel} from 'makerjs';

export type ScrewSize = 'm4';

export type Nut = {
  sideToSide: number;
  thickness: number;
  holeRadius: number;
  borderRadius: number;
};

type VerticalDrawOptions = {
  points: IPoint[];
  size: ScrewSize;
};

export const nutSpecs: Record<ScrewSize, Nut> = {
  m4: {
    sideToSide: 7,
    thickness: 3.2,
    holeRadius: 2,
    borderRadius: 7.7,
  },
};

export function nutHolesVertical({
  points,
  size,
}: VerticalDrawOptions): IModel {
  const s = nutSpecs[size];

  const holes: {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, point] of points.entries()) {
    const hole = new models.Polygon(6, s.sideToSide / 2, 90);
    model.move(hole, point);
    holes.models[`nut${i}`] = hole;
  }

  return holes;
}

type HorizontalDrawOptions = VerticalDrawOptions & {
  direction: 'left' | 'right' | 'front' | 'back';
  isCenter: boolean;
};

function tJoint({size, isCenter}: {size: ScrewSize; isCenter: boolean}) {
  const s = nutSpecs[size];
  const w = s.thickness;
  const h = s.sideToSide;

  const largeNumber = 60;
  const safeNumber = 5;

  const hole = new models.Rectangle(largeNumber, s.holeRadius);
  model.moveRelative(hole, [safeNumber, h / 2]);

  const nut = {
    models: {
      nut: {
        ...new models.Rectangle(w, h),
        origin: [-w / 2, -h / 2],
      },
    },
  };

  const holes = {
    ...new models.Rectangle(largeNumber, s.holeRadius),
    origin: [-largeNumber + safeNumber, -s.holeRadius / 2],
  };

  return isCenter ? model.combineUnion(nut, holes) : nut;
}

export function nutHolesHorizontal({
  points,
  size,
  direction,
  isCenter,
}: HorizontalDrawOptions) {
  const holes: {models: Record<string, IModel>} = {
    models: {},
  };

  for (const [i, point] of points.entries()) {
    const t = tJoint({size, isCenter});

    switch (direction) {
      case 'left': {
        break;
      }

      case 'right': {
        model.rotate(t, 180);

        break;
      }

      case 'front': {
        model.rotate(t, -90);

        break;
      }

      case 'back': {
        model.rotate(t, 90);

        break;
      }
    // No default
    }

    model.move(t, point);
    holes.models[`${direction}TJoint${i}`] = t;
  }

  return holes;
}
