import {models, model, measure} from 'makerjs';
import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {mirrorX, mirrorY} from '@helpers/mirror';
import {buttonSpec, buttons} from './sanwa';
import {neutrik} from './neutrik';

function getSidePlateDimensions() {
  const config = getConfig();

  const safeNumber = 5;

  const {width, height, borderRadius, plateThickness} = config;
  const x = width - (borderRadius * 2) - safeNumber;
  const y = height - (borderRadius * 2) - safeNumber;
  const thickness = plateThickness;
  return {x, y, thickness};
}

export function sidePlatesVertical() {
  const {width, height} = getConfig();
  const {x, y, thickness} = getSidePlateDimensions();

  const smallNumber = 0.05;

  const rectH = new models.Rectangle(thickness + smallNumber, y);
  const rectW = new models.Rectangle(x, thickness + smallNumber);

  const front = model.clone(rectW);
  model.moveRelative(front, [-x / 2, 0]);
  model.moveRelative(front, [width / 2, height - thickness]);
  const back = model.clone(rectW);
  model.moveRelative(back, [-x / 2, 0]);
  model.moveRelative(back, [width / 2, -smallNumber]);

  const left = model.clone(rectH);
  model.moveRelative(left, [0, -y / 2]);
  model.moveRelative(left, [-smallNumber, height / 2]);
  const right = model.clone(rectH);
  model.moveRelative(right, [0, -y / 2]);
  model.moveRelative(right, [width - thickness, height / 2]);

  return {
    models: {
      front,
      back,
      left,
      right,
    },
  };
}

export function sidePlateLeft() {
  const {y} = getSidePlateDimensions();
  const {height, sidePlateScrewLayers, requriedCornerLayers, plateThickness, sidePlateScrewPositions} = getConfig();

  const y1 = sidePlateScrewPositions.left.front[1];
  const y2 = sidePlateScrewPositions.left.back[1];

  const holes = [];

  for (let i = 0; i < requriedCornerLayers; i++) {
    if (sidePlateScrewLayers.includes(i)) {
      const x = (i * plateThickness) + (plateThickness / 2);
      holes.push([x, y1], [x, y2]);
    }
  }

  const toAbsolutePosition = (height - y) / 2;

  const m = {
    models: {
      rect: {
        // Add 0.5 for clearance
        ...new models.Rectangle((requriedCornerLayers * plateThickness) - 0.5, y - 0.5),
        origin: [0.25, 0.25],
      },
      holes: {
        ...screwHoles({points: holes, size: 'm4'}),
        origin: [0, -toAbsolutePosition],
      },
    },
  };

  model.moveRelative(m, [-10 - (requriedCornerLayers * plateThickness), toAbsolutePosition]);

  return m;
}

export function sidePlateBack() {
  const {x} = getSidePlateDimensions();
  const {width, sidePlateScrewLayers, requriedCornerLayers, plateThickness, sidePlateScrewPositions} = getConfig();

  const x1 = sidePlateScrewPositions.back.left[0];
  const x2 = sidePlateScrewPositions.back.right[0];

  const holes = [];

  for (let i = 0; i < requriedCornerLayers; i++) {
    if (sidePlateScrewLayers.includes(i)) {
      const y = (i * plateThickness) + (plateThickness / 2);
      holes.push([x1, y], [x2, y]);
    }
  }

  const toAbsolutePosition = (width - x) / 2;

  const m = {
    models: {
      rect: {
        // Add 0.5 for clearance
        ...new models.Rectangle(x - 0.5, (requriedCornerLayers * plateThickness) - 0.5),
        origin: [0.25, 0.25],
      },
      holes: {
        ...screwHoles({points: holes, size: 'm4'}),
        origin: [-toAbsolutePosition, 0],
      },
      buttons: {},
      neutrik: {},
    },
    origin: [0, 0],
  };

  model.moveRelative(m, [toAbsolutePosition, -10 - (requriedCornerLayers * plateThickness)]);

  return m;
}

export function sidePlates() {
  const {cornerScrewPositions, conrerScrewMagicNumber} = getConfig();

  const left = sidePlateLeft();
  const right = mirrorY(left);

  const back = sidePlateBack();

  const front = mirrorX(back);
  const ext = measure.modelExtents(front);
  const y = ext.height / 2;
  const closestScrewX = cornerScrewPositions.frontLeft.top[0];
  const cornerX = closestScrewX - front.origin[0] + conrerScrewMagicNumber;
  const startX = cornerX + buttonSpec.obsf24.outerRadius + 5;

  front.models.buttons = buttons({
    points: [
      // Left
      [startX, -y],
      [startX + 30, -y],
      // Right
      [ext.width - startX, -y],
      [ext.width - startX - 30, -y],
    ],
    size: 'obsf24',
    // No slot for the front side plate
    isClearPlate: true,
    isAboveClearPlate: true,
  });

  front.models.neutrik = neutrik({point: [ext.width / 2, -y]});

  return {
    models: {
      left,
      right,
      front,
      back,
    },
  };
}
