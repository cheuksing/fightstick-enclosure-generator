import {type IPoint, models, type IModel} from 'makerjs';

export type ScrewSize = 'm4';

export type ScrewSpecs = {
  holeRadius: number;
  headDiameter: number;
};

type DrawOptions = {
  points: IPoint[];
  size: ScrewSize;
};

export const screwSpecs: Record<ScrewSize, ScrewSpecs> = {
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
