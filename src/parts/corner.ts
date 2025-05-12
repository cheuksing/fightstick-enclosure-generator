import {model, models, paths, type IModel, type IPoint} from 'makerjs';
import {getConfig} from '@config';
import {common} from './common';
import {sidePlatesVertical} from './side-plate';
import {screwHoles} from '@fasteners/screw';
import {nutHolesHorizontal, nutHolesVertical} from '@fasteners/nut';
import {mirrorY} from '@helpers/mirror';

function frontLeftBox() {
  const {height, conrerScrewMagicNumber, cornerScrewPositions, clearPlateScrewPositions, isClearPlateBackScrewCloserToBackThanFront} = getConfig();

  const w = Math.max(cornerScrewPositions.frontLeft.bottom1[0], cornerScrewPositions.frontLeft.bottom2[0]) + conrerScrewMagicNumber;
  const h = height - Math.min(cornerScrewPositions.frontLeft.bottom1[1], cornerScrewPositions.frontLeft.bottom2[1], isClearPlateBackScrewCloserToBackThanFront ? height : clearPlateScrewPositions.backLeft[1]) + conrerScrewMagicNumber;

  return [w, h];
}

function frontLeftVerticalScrews(layerIdx: number) {
  const {cornerScrewPositions, clearPlateScrewPositions, isClearPlateBackScrewCloserToBackThanFront, requriedCornerLayers, isClearPlateEnabled} = getConfig();

  const m4 = screwHoles({
    points: [
      (layerIdx !== 0) && cornerScrewPositions.frontLeft.bottom1,
      (layerIdx !== 0) && cornerScrewPositions.frontLeft.bottom2,
      (layerIdx !== requriedCornerLayers - 1) && (isClearPlateEnabled ? cornerScrewPositions.frontLeft.top : clearPlateScrewPositions.frontLeft),
      (isClearPlateEnabled && layerIdx !== 0) && clearPlateScrewPositions.frontLeft,
      (isClearPlateEnabled && layerIdx !== 0) && !isClearPlateBackScrewCloserToBackThanFront && clearPlateScrewPositions.backLeft,
    ].filter(Boolean) as IPoint[],
    size: 'm4',
  });

  const nut = nutHolesVertical({
    points: [
      (layerIdx === 0) && cornerScrewPositions.frontLeft.bottom1,
      (layerIdx === 0) && cornerScrewPositions.frontLeft.bottom2,
      (layerIdx === requriedCornerLayers - 1) && (isClearPlateEnabled ? cornerScrewPositions.frontLeft.top : clearPlateScrewPositions.frontLeft),
      (isClearPlateEnabled && layerIdx === 0) && clearPlateScrewPositions.frontLeft,
      (isClearPlateEnabled && layerIdx === 0) && !isClearPlateBackScrewCloserToBackThanFront && clearPlateScrewPositions.backLeft,
    ].filter(Boolean) as IPoint[],
    size: 'm4',
  });

  return {m4, nut};
}

function frontLeftHorizontalScrews(layerIdx: number, originalBorder: IModel, axis: 'x' | 'y' | 'xy') {
  const {sidePlateScrewPositions, sidePlateScrewLayers} = getConfig();

  const isHoleLayer = sidePlateScrewLayers.includes(layerIdx);
  const isNutOnlyLayer = sidePlateScrewLayers.includes(layerIdx - 1) || sidePlateScrewLayers.includes(layerIdx + 1);

  if (isHoleLayer || isNutOnlyLayer) {
    const b = {};

    if (axis.includes('y')) {
      const y = nutHolesHorizontal({points: [sidePlateScrewPositions.left.front], size: 'm4', direction: 'left', isCenter: isHoleLayer});
      model.addModel(b, y, 'horizontalScrewY');
    }

    if (axis.includes('x')) {
      const x = nutHolesHorizontal({points: [sidePlateScrewPositions.front.left], size: 'm4', direction: 'front', isCenter: isHoleLayer});
      model.addModel(b, x, 'horizontalScrewX');
    }

    const combinedBorder = model.combineSubtraction(originalBorder, b);
    return combinedBorder;
  }

  return originalBorder;
}

function frontLeftCorner(layerIdx: number, isClearPlateEnabled: boolean) {
  const {height} = getConfig();

  const [w, h] = frontLeftBox();

  const rect: IModel = isClearPlateEnabled ? new models.Rectangle(w, h) : {
    paths: {
      // Quarter circle with right bottom corner
      top: new paths.Line([0, w], [w, w]),
      left: new paths.Line([0, w], [0, 0]),
      arc: new paths.Arc([0, w], w, 270, 0),
    },
  };

  model.moveRelative(rect, [0, height - h]);

  let border: IModel = rect;
  border = frontLeftHorizontalScrews(layerIdx, border, 'xy');
  border = model.combineSubtraction(border, sidePlatesVertical());
  border = model.combineIntersection(border, common());

  const {m4, nut} = frontLeftVerticalScrews(layerIdx);

  const m = {
    models: {
      border: {
        models: {
          border,
          m4,
          cutout: nut,
        },
      },
    },
  };

  return m;
}

function backLeftBox() {
  const {conrerScrewMagicNumber, cornerScrewPositions, isClearPlateBackScrewCloserToBackThanFront, clearPlateScrewPositions} = getConfig();

  const w = Math.max(cornerScrewPositions.backLeft.bottom1[0], cornerScrewPositions.backLeft.bottom2[0]) + conrerScrewMagicNumber;
  const h = Math.max(cornerScrewPositions.backLeft.bottom1[1], cornerScrewPositions.backLeft.bottom2[1], isClearPlateBackScrewCloserToBackThanFront ? clearPlateScrewPositions.backLeft[1] : 0) + conrerScrewMagicNumber;

  return [w, h];
}

function backLeftVerticalScrews(layerIdx: number) {
  const {cornerScrewPositions, isClearPlateBackScrewCloserToBackThanFront, clearPlateScrewPositions, requriedCornerLayers, isClearPlateEnabled} = getConfig();

  const m4 = screwHoles({
    points: [
      (layerIdx !== 0) && cornerScrewPositions.backLeft.bottom1,
      (layerIdx !== 0) && cornerScrewPositions.backLeft.bottom2,
      (layerIdx !== requriedCornerLayers - 1) && (isClearPlateEnabled ? cornerScrewPositions.backLeft.top : clearPlateScrewPositions.backLeft),
      (isClearPlateEnabled && layerIdx !== 0) && isClearPlateBackScrewCloserToBackThanFront && clearPlateScrewPositions.backLeft,
    ].filter(Boolean) as IPoint[],
    size: 'm4',
  });

  const nut = nutHolesVertical({
    points: [
      (layerIdx === 0) && cornerScrewPositions.backLeft.bottom1,
      (layerIdx === 0) && cornerScrewPositions.backLeft.bottom2,
      (layerIdx === requriedCornerLayers - 1) && (isClearPlateEnabled ? cornerScrewPositions.backLeft.top : clearPlateScrewPositions.backLeft),
      (isClearPlateEnabled && layerIdx === 0) && isClearPlateBackScrewCloserToBackThanFront && clearPlateScrewPositions.backLeft,
    ].filter(Boolean) as IPoint[],
    size: 'm4',
  });

  return {m4, nut};
}

function backLeftHorizontalScrews(layerIdx: number, originalBorder: IModel, axis: 'x' | 'y' | 'xy') {
  const {sidePlateScrewPositions, sidePlateScrewLayers} = getConfig();

  const isHoleLayer = sidePlateScrewLayers.includes(layerIdx);
  const isNutOnlyLayer = sidePlateScrewLayers.includes(layerIdx - 1) || sidePlateScrewLayers.includes(layerIdx + 1);

  if (isHoleLayer || isNutOnlyLayer) {
    const a = model.clone(originalBorder);

    const b = {};

    if (axis.includes('y')) {
      const y = nutHolesHorizontal({points: [sidePlateScrewPositions.left.back], size: 'm4', direction: 'left', isCenter: isHoleLayer});
      model.addModel(b, y, 'horizontalScrewY');
    }

    if (axis.includes('x')) {
      const x = nutHolesHorizontal({points: [sidePlateScrewPositions.back.left], size: 'm4', direction: 'back', isCenter: isHoleLayer});
      model.addModel(b, x, 'horizontalScrewX');
    }

    const combinedBorder = model.combineSubtraction(a, b);
    return combinedBorder;
  }

  return originalBorder;
}

function backLeftCorner(layerIdx: number, isClearPlateEnabled: boolean) {
  const [w, h] = backLeftBox();

  const box: IModel = isClearPlateEnabled ? new models.Rectangle(w, h) : {
    paths: {
      // Quarter circle with right top corner
      arc: new paths.Arc([0, 0], w, 0, 90),
      left: new paths.Line([0, 0], [0, w]),
      bottom: new paths.Line([0, 0], [w, 0]),
    },
  };

  let border: IModel = box;
  border = backLeftHorizontalScrews(layerIdx, border, 'xy');
  border = model.combineSubtraction(border, sidePlatesVertical());
  border = model.combineIntersection(border, common());

  const {m4, nut} = backLeftVerticalScrews(layerIdx);

  const m = {
    models: {
      border: {
        models: {
          border,
          m4,
          cutout: nut,
        },
      },
    },
  };

  return m;
}

function leftStandoff(layerIdx: number) {
  const {height} = getConfig();
  const width = Math.max(frontLeftBox()[0], backLeftBox()[0]);

  let border: IModel = new models.Rectangle(width, height);

  border = frontLeftHorizontalScrews(layerIdx, border, 'x');
  border = backLeftHorizontalScrews(layerIdx, border, 'x');

  const sidePlates = sidePlatesVertical();

  border = model.combineSubtraction(border, sidePlates.models.front);
  border = model.combineSubtraction(border, sidePlates.models.back);
  border = model.combineIntersection(border, common());

  const flvs = frontLeftVerticalScrews(layerIdx);
  const blvs = backLeftVerticalScrews(layerIdx);

  const m = {
    models: {
      border: {
        models: {
          border,
          m4: {
            models: {
              blvs: blvs.m4,
              flvs: flvs.m4,
            },
          },
          cutout: {
            models: {
              blvs: blvs.nut,
              flvs: flvs.nut,
            },
          },
        },
      },
    },
  };

  return m;
}

type CornersModel = {
  models: {
    frontLeft: IModel;
    backLeft: IModel;
    frontRight: IModel;
    backRight: IModel;
  } | {
    left: IModel;
    right: IModel;
  };
};

type AllCornersModel = {
  models: Record<string, CornersModel>;
} & IModel;

export function corners(): AllCornersModel {
  const {requriedCornerLayers, height, mergeFrontBackCorners, isClearPlateEnabled} = getConfig();

  const m: AllCornersModel = {
    models: {},
  };

  const isOverlap = frontLeftBox()[1] + backLeftBox()[1] >= height;
  const shouldFrontBackMerge = mergeFrontBackCorners || isOverlap;

  for (let i = 0; i < requriedCornerLayers; i++) {
    let corners: CornersModel;

    if (shouldFrontBackMerge) {
      const left = leftStandoff(i);
      const right = mirrorY(left);

      corners = {
        models: {
          left,
          right,
        },
      };
    } else {
      const fl = frontLeftCorner(i, isClearPlateEnabled);
      const bl = backLeftCorner(i, isClearPlateEnabled);

      corners = {
        models: {
          frontLeft: fl,
          backLeft: bl,
          frontRight: mirrorY(fl),
          backRight: mirrorY(bl),
        },
      };
    }

    m.models[`layer${i}`] = corners;
  }

  return m;
}
