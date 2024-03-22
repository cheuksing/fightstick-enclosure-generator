import {models, model, chain, paths, point} from 'makerjs';
import {filletG2Continunity} from '@helpers/fillet';
import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {layout, walkLayout} from '@helpers/layout';
import {buttonSpec} from '@parts/sanwa';
import {LayerName} from '@helpers/color';

const buffer = 3;

export function artworkReference() {
  const config = getConfig();

  const {clearPlateWidth, clearPlateHeight, innerRadius, clearPlateScrewPositions} = config;

  const width = clearPlateWidth - (buffer * 2);
  const height = clearPlateHeight - (buffer * 2);

  const dimension = new models.Rectangle(width, height);
  let temporary = model.clone(dimension);

  const toClearPlateCenter = [width / 2, height / 2];
  const toAbsolutePosition = [buffer + config.borders, buffer + config.borders + config.palmRest];

  walkLayout(l => {
    const x = l.x;
    const y = l.y;
    const t = l.t;

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
  const filletArc = filletG2Continunity(c, innerRadius - buffer, 0.5);

  const border = {
    models: {
      filletArc,
      straightLines: chain.toNewModel(c),
    },
  };

  const m = {
    models: {
      border,
      m4: {
        ...screwHoles({points: Object.values(clearPlateScrewPositions), size: 'm4'}),
        origin: [-toAbsolutePosition[0], -toAbsolutePosition[1]],
      },
      cutout: layout({relativeOrigin: [width / 2, height / 2], isClearPlate: true}),
    },
    origin: toAbsolutePosition,
    layer: LayerName.artworkReference,
  };

  return m;
}

