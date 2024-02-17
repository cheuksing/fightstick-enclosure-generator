import {models, model, chain, measure, paths, point} from 'makerjs';
import {filletG2Continunity} from '@helpers/fillet';
import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {layout, walkLayout} from '@layouts/index';
import {buttonSpec} from './sanwa';

export function clearPlate(): BaseModel {
  const config = getConfig();

  const {clearPlateWidth, clearPlateHeight, innerRadius, clearPlateScrewPositions} = config;

  const dimension = new models.Rectangle(clearPlateWidth, clearPlateHeight);
  let temporary = model.clone(dimension);

  const toClearPlateCenter = [clearPlateWidth / 2, clearPlateHeight / 2];
  const toAbsolutePosition = [config.borders, config.borders + config.palmRest];

  // If below plate's buttons close to the edge, reduce clear plate size
  walkLayout(({x, y, t, isBelow}) => {
    if (!isBelow) {
      return;
    }

    if (t !== 'obsf24' && t !== 'obsf30') {
      return;
    }

    const b = buttonSpec[t];
    const r = b.outerRadius + 3;

    const p = point.add([x, y], toClearPlateCenter);

    let isCloseToEdge = false;

    for (const rectPathId in dimension.paths) {
      if (!isCloseToEdge) {
        const rectPath = dimension.paths[rectPathId];
        const closeEnougth = measure.isPointOnPath(p, rectPath, r + 3);
        if (!closeEnougth) {
          isCloseToEdge = true;
        }
      }
    }

    temporary = model.combineSubtraction(temporary, {
      paths: {
        a: new paths.Circle(p, r + 3),
      },
    });
  });

  // If above plate's buttons close to the edge, increase clear plate size
  walkLayout(({x, y, t, isBelow}) => {
    if (isBelow) {
      return;
    }

    if (t !== 'obsf24' && t !== 'obsf30') {
      return;
    }

    const b = buttonSpec[t];
    const r = b.outerRadius + 3;
    const p = point.add([x, y], toClearPlateCenter);

    temporary = model.combineUnion(temporary, {
      paths: {
        a: new paths.Circle(p, r),
      },
    });
  });

  const c = model.findSingleChain(temporary);
  const filletArc = filletG2Continunity(c, innerRadius, 0.5);

  const border = {
    models: {
      filletArc,
      straightLines: chain.toNewModel(c),
    },
  };

  const m: BaseModel = {
    models: {
      border,
    },
  };

  const m4 = screwHoles({points: Object.values(clearPlateScrewPositions), size: 'm4'});

  m.models.m4 = {
    ...m4,
    origin: [-toAbsolutePosition[0], -toAbsolutePosition[1]],
  };

  model.moveRelative(m, toAbsolutePosition);

  m.models.cutout = layout({relativeOrigin: [clearPlateWidth / 2, clearPlateHeight / 2], isClearPlate: true});

  return m;
}

