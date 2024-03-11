import {type IPoint, models, type IModel} from 'makerjs';

export type ScrewSize = 'm3' | 'm4';

export type ScrewSpecs = {
  holeRadius: number;
  headDiameter: number;
};

type DrawOptions = {
  points: IPoint[];
  size: ScrewSize;
};

export const screwSpecs: Record<ScrewSize, ScrewSpecs> = {
  m3: {
    headDiameter: 6,
    holeRadius: 1.5,
  },
  m4: {
    headDiameter: 8,
    holeRadius: 2,
  },
};

export function screwHoles({
  points,
  size,
}: DrawOptions): IModel {
  const s = screwSpecs[size];

  const m = new models.Holes(s.holeRadius, points);

  return m;
}
