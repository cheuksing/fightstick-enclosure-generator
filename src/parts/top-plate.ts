import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {common} from './common';
import {layout} from '@helpers/layout';

export function topPlate(): BaseModel {
  const {width, clearPlateHeight, cornerScrewPositions, borders, palmRest} = getConfig();

  const screws = [
    cornerScrewPositions.backLeft.top,
    cornerScrewPositions.backRight.top,
    cornerScrewPositions.frontLeft.top,
    cornerScrewPositions.frontRight.top,
  ];

  const border = common();

  const dy = (clearPlateHeight / 2) + borders + palmRest;

  const m: BaseModel = {
    models: {
      border,
      m4: screwHoles({points: screws, size: 'm4'}),
      cutout: layout({relativeOrigin: [width / 2, dy], isClearPlate: false}),
    },
  };

  return m;
}

