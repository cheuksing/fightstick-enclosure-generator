import {models, model, measure} from 'makerjs';
import {getConfig} from '@config';
import {screwHoles} from '@fasteners/screw';
import {mirrorX, mirrorY} from '@helpers/mirror';
import {buttonSpec, buttons} from './sanwa';
import {neutrik} from './neutrik';
import {LayerName} from '@helpers/color';

const safeNumber = 5;

function getSidePlateDimensions() {
  const config = getConfig();

  const {width, height, borderRadius} = config;
  const x = width - (borderRadius * 2) - safeNumber;
  const y = height - (borderRadius * 2) - safeNumber;
  return {x, y};
}

export function sidePlatesVertical() {
  const {width, height, frontPlateThickness, backPlateThickness, leftRightPlateThickness} = getConfig();
  const {x, y} = getSidePlateDimensions();

  const smallNumber = 0.05;

  const front = new models.Rectangle(x, frontPlateThickness + smallNumber);
  model.moveRelative(front, [-x / 2, 0]);
  model.moveRelative(front, [width / 2, height - frontPlateThickness]);
  const back = new models.Rectangle(x, backPlateThickness + smallNumber);
  model.moveRelative(back, [-x / 2, 0]);
  model.moveRelative(back, [width / 2, -smallNumber]);

  const left = new models.Rectangle(leftRightPlateThickness + smallNumber, y);
  model.moveRelative(left, [0, -y / 2]);
  model.moveRelative(left, [-smallNumber, height / 2]);
  const right = new models.Rectangle(leftRightPlateThickness + smallNumber, y);
  model.moveRelative(right, [0, -y / 2]);
  model.moveRelative(right, [width - leftRightPlateThickness, height / 2]);

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
  const {height, sidePlateScrewLayers, requriedCornerLayers, cornersPlateThickness, sidePlateScrewPositions} = getConfig();

  const y1 = sidePlateScrewPositions.left.front[1];
  const y2 = sidePlateScrewPositions.left.back[1];

  const holes = [];

  for (let i = 0; i < requriedCornerLayers; i++) {
    if (sidePlateScrewLayers.includes(i)) {
      const x = (i * cornersPlateThickness) + (cornersPlateThickness / 2);
      holes.push([x, y1], [x, y2]);
    }
  }

  const toAbsolutePosition = (height - y) / 2;

  const m = {
    models: {
      rect: {
        // Add 0.5 for clearance
        ...new models.Rectangle((requriedCornerLayers * cornersPlateThickness) - 0.5, y - 0.5),
        origin: [0.25, 0.25],
      },
      holes: {
        ...screwHoles({points: holes, size: 'm4'}),
        origin: [0, -toAbsolutePosition],
        layer: LayerName.m4,
      },
    },
  };

  model.moveRelative(m, [-10 - (requriedCornerLayers * cornersPlateThickness), toAbsolutePosition]);

  return m;
}

export function sidePlateBack() {
  const {x} = getSidePlateDimensions();
  const {width, sidePlateScrewLayers, requriedCornerLayers, cornersPlateThickness, sidePlateScrewPositions} = getConfig();

  const x1 = sidePlateScrewPositions.back.left[0];
  const x2 = sidePlateScrewPositions.back.right[0];

  const holes = [];

  for (let i = 0; i < requriedCornerLayers; i++) {
    if (sidePlateScrewLayers.includes(i)) {
      const y = (i * cornersPlateThickness) + (cornersPlateThickness / 2);
      holes.push([x1, y], [x2, y]);
    }
  }

  const toAbsolutePosition = (width - x) / 2;

  const m = {
    models: {
      rect: {
        // Add 0.5 for clearance
        ...new models.Rectangle(x - 0.5, (requriedCornerLayers * cornersPlateThickness) - 0.5),
        origin: [0.25, 0.25],
      },
      holes: {
        ...screwHoles({points: holes, size: 'm4'}),
        origin: [-toAbsolutePosition, 0],
        layer: LayerName.m4,
      },
      buttons: {},
      neutrik: {},
    },
    origin: [0, 0],
  };

  model.moveRelative(m, [toAbsolutePosition, -10 - (requriedCornerLayers * cornersPlateThickness)]);

  return m;
}

export function sidePlates() {
  const {cornerScrewPositions, conrerScrewMagicNumber, leftOptionButtonsNumber, rightOptionButtonsNumber} = getConfig();

  const left = sidePlateLeft();
  const right = mirrorY(left);

  const back = sidePlateBack();

  const front = mirrorX(back);
  const ext = measure.modelExtents(front);
  const y = ext.height / 2;
  const closestScrewX = cornerScrewPositions.frontLeft.top[0];
  const cornerX = closestScrewX - front.origin[0] + conrerScrewMagicNumber;
  const startX = cornerX + buttonSpec.obsf24.outerRadius + safeNumber;

  const buttonPts = [];

  for (let i = 0; i < leftOptionButtonsNumber; i++) {
    buttonPts.push([startX + (i * 30), -y]);
  }

  for (let i = 0; i < rightOptionButtonsNumber; i++) {
    buttonPts.push([ext.width - startX - (i * 30), -y]);
  }

  front.models.buttons = buttons({
    points: buttonPts,
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
