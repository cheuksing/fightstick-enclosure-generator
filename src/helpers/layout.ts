import {getConfig} from '@config';
import {brookPcbsMountingHoles} from '@parts/brook';
import {buttons} from '@parts/sanwa';
import {sticks} from '@parts/stick';
import {type LayoutItem} from '@schema';
import {model, type IPoint} from 'makerjs';

type DrawOptions = {
  relativeOrigin: IPoint;
  isClearPlate: boolean;
};

export function walkLayout(cb: (i: Required<LayoutItem>) => void) {
  const {layout, layoutOffsetX, layoutOffsetY} = getConfig();

  for (const {x: _x, y: _y, t, isBelow} of layout) {
    const x = _x + layoutOffsetX;
    const y = _y + layoutOffsetY;
    cb({x, y, t, isBelow: isBelow ?? false});
  }
}

export function layout({relativeOrigin, isClearPlate}: DrawOptions) {
  const obsf24Pts: IPoint[] = [];
  const obsf24BelowPlatePts: IPoint[] = [];
  const obsf30Pts: IPoint[] = [];
  const obsf30BelowPlate: IPoint[] = [];
  const brookPts: IPoint[] = [];
  const stickPts: IPoint[] = [];

  walkLayout(({x, y, t, isBelow}) => {
    if (t === 'obsf24') {
      (isBelow ? obsf24BelowPlatePts : obsf24Pts).push([x, y]);
    }

    if (t === 'obsf30') {
      (isBelow ? obsf30BelowPlate : obsf30Pts).push([x, y]);
    }

    if (t === 'brook' && !isClearPlate) {
      brookPts.push([x, y]);
    }

    if (t === 'stick') {
      stickPts.push([x, y]);
    }
  });

  const b1 = buttons({points: obsf24Pts, size: 'obsf24', isClearPlate, isAboveClearPlate: true});
  const b2 = buttons({points: obsf30Pts, size: 'obsf30', isClearPlate, isAboveClearPlate: true});

  const brookPcbsMounts = brookPcbsMountingHoles({points: brookPts});
  const s = sticks({points: stickPts, isClearPlate});

  const m = {
    models: {
      obsf24: b1,
      obsf30: b2,
      brooks: brookPcbsMounts,
      sticks: s,
    },
    origin: relativeOrigin,
  };

  if (!isClearPlate) {
    const b3 = buttons({points: obsf24BelowPlatePts, size: 'obsf24', isClearPlate, isAboveClearPlate: false});
    const b4 = buttons({points: obsf30BelowPlate, size: 'obsf30', isClearPlate, isAboveClearPlate: false});

    model.addModel(m, b3, 'obsf24BelowPlatePts');
    model.addModel(m, b4, 'obsf30BelowPlate');
  }

  return m;
}
