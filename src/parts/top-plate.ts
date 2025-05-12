import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {common} from './common';
import {layout} from '@helpers/layout';
import {LayerName} from '@helpers/color';

export function topPlate() {
  const {width, clearPlateHeight, cornerScrewPositions, borders, palmRest, clearPlateScrewPositions, isClearPlateEnabled} = getConfig();

  const screws = isClearPlateEnabled
    ? [
      cornerScrewPositions.backLeft.top,
      cornerScrewPositions.backRight.top,
      cornerScrewPositions.frontLeft.top,
      cornerScrewPositions.frontRight.top,
    ] : [
      clearPlateScrewPositions.backLeft,
      clearPlateScrewPositions.backRight,
      clearPlateScrewPositions.frontLeft,
      clearPlateScrewPositions.frontRight,
    ];

  const border = common();

  const dy = (clearPlateHeight / 2) + borders + palmRest;

  const m = {
    models: {
      border: {
        ...border,
        layer: LayerName.topPlateBorder,
      },
      m4c: {
        ...screwHoles({points: screws, size: 'm4'}),
        layer: LayerName.m4Countersunk,
      },
      m4: {
        layer: LayerName.m4,
      },
      cutout: layout({relativeOrigin: [width / 2, dy], isClearPlate: false, isClearPlateEnabled}),
    },
  };

  if (isClearPlateEnabled) {
    Object.assign(m.models.m4, screwHoles({points: Object.values(clearPlateScrewPositions), size: 'm4'}));
  }

  return m;
}

