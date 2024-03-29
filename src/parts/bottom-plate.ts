import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {common} from './common';
import {LayerName} from '@helpers/color';

export function bottomPlate() {
  const config = getConfig();

  const {cornerScrewPositions} = config;

  const screws = [
    cornerScrewPositions.backLeft.bottom1,
    cornerScrewPositions.backLeft.bottom2,
    cornerScrewPositions.backRight.bottom1,
    cornerScrewPositions.backRight.bottom2,
    cornerScrewPositions.frontLeft.bottom1,
    cornerScrewPositions.frontLeft.bottom2,
    cornerScrewPositions.frontRight.bottom1,
    cornerScrewPositions.frontRight.bottom2,
  ];

  const m = {
    models: {
      border: {
        ...common(),
        layer: LayerName.bottomPlateBorder,
      },
      m4: {
        ...screwHoles({points: screws, size: 'm4'}),
        layer: LayerName.m4Countersunk,
      },
    },
  };

  return m;
}

