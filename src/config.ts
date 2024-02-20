import {buttonSpec} from '@parts/sanwa';
import {type Config} from '@schema';
import {type IPoint, measure} from 'makerjs';
import {presets} from '@presets';

const conrerScrewMagicNumber = 15;

export function getClearPlateScrewPositions(config: Config) {
  const {width, height, borders, palmRest, clearPlateScrewOffset} = config;

  const clearPlateBreakpoint = palmRest + borders;

  return {
    frontLeft: [borders + clearPlateScrewOffset, height - borders - clearPlateScrewOffset],
    backLeft: [borders + clearPlateScrewOffset, clearPlateBreakpoint + clearPlateScrewOffset],
    frontRight: [width - borders - clearPlateScrewOffset, height - borders - clearPlateScrewOffset],
    backRight: [width - borders - clearPlateScrewOffset, clearPlateBreakpoint + clearPlateScrewOffset],
  };
}

export function getCornerScrewPositions(config: Config, option: {
  clearPlateScrewPositions: {
    frontLeft: IPoint;
    frontRight: IPoint;
    backLeft: IPoint;
    backRight: IPoint;
  };
}) {
  const {clearPlateScrewOffset, borders} = config;
  const {clearPlateScrewPositions} = option;

  const safeNumber = 2;

  function frontLeftCornerScrew() {
    const x = clearPlateScrewPositions.frontLeft[0] + safeNumber;
    const y = clearPlateScrewPositions.frontLeft[1] - safeNumber;

    const bottom1X = x + (conrerScrewMagicNumber * 2);
    const bottom2X = x;
    const bottom1Y = y;
    const bottom2Y = y - (conrerScrewMagicNumber * 2);

    const bottom1 = [bottom1X, bottom1Y];
    const bottom2 = [bottom2X, bottom2Y];
    const top = [bottom1X, bottom2Y];

    return {top, bottom1, bottom2};
  }

  function frontRightCornerScrew() {
    const x = clearPlateScrewPositions.frontRight[0] - safeNumber;
    const y = clearPlateScrewPositions.frontRight[1] - safeNumber;

    const bottom1X = x - (conrerScrewMagicNumber * 2);
    const bottom2X = x;
    const bottom1Y = y;
    const bottom2Y = y - (conrerScrewMagicNumber * 2);

    const bottom1 = [bottom1X, bottom1Y];
    const bottom2 = [bottom2X, bottom2Y];
    const top = [bottom1X, bottom2Y];

    return {top, bottom1, bottom2};
  }

  function backLeftCornerScrew() {
    const x = clearPlateScrewPositions.frontLeft[0];
    const y = borders + clearPlateScrewOffset;

    const bottom1X = x + (conrerScrewMagicNumber * 2);
    const bottom2X = x;
    const bottomY = y;
    const topY = y + (conrerScrewMagicNumber * 2);

    const bottom1 = [bottom1X, bottomY];
    const bottom2 = [bottom2X, topY];

    const top = Math.abs(y - clearPlateScrewPositions.backLeft[1]) < 15 ? [bottom1X, topY] : [bottom2X, bottomY];

    return {top, bottom1, bottom2};
  }

  function backRightCornerScrew() {
    const x = clearPlateScrewPositions.frontRight[0];
    const y = borders + clearPlateScrewOffset;

    const bottom1X = x - (conrerScrewMagicNumber * 2);
    const bottom2X = x;
    const bottomY = y;
    const topY = y + (conrerScrewMagicNumber * 2);

    const bottom1 = [bottom1X, bottomY];
    const bottom2 = [bottom2X, topY];

    const top = Math.abs(y - clearPlateScrewPositions.backRight[1]) < 15 ? [bottom1X, topY] : [bottom2X, bottomY];

    return {top, bottom1, bottom2};
  }

  return {
    frontLeft: frontLeftCornerScrew(),
    frontRight: frontRightCornerScrew(),
    backLeft: backLeftCornerScrew(),
    backRight: backRightCornerScrew(),
  };
}

export function computeConfig(config: Config) {
  const {width, height, borders, palmRest, clearPlateThickness, plateThickness, minDepth} = config;

  const centerX = width / 2;
  const centerY = height / 2;

  const clearPlateScrewPositions = getClearPlateScrewPositions(config);

  const cornerScrewPositions = getCornerScrewPositions(config, {
    clearPlateScrewPositions,
  });

  const isClearPlateBackScrewCloserToCenterThanCornerScrew = measure.pointDistance(clearPlateScrewPositions.backLeft, clearPlateScrewPositions.backRight) < measure.pointDistance(cornerScrewPositions.backLeft.top, cornerScrewPositions.backRight.top);
  const isClearPlateBackScrewCloserToBackThanFront = centerY > clearPlateScrewPositions.backLeft[1];

  const sidePlateScrewPositions = {
    front: {
      left: [clearPlateScrewPositions.frontLeft[0] + conrerScrewMagicNumber, clearPlateScrewPositions.frontLeft[1]],
      right: [clearPlateScrewPositions.frontRight[0] - conrerScrewMagicNumber, clearPlateScrewPositions.frontRight[1]],
    },
    back: {
      left: [clearPlateScrewPositions.backLeft[0] + conrerScrewMagicNumber, cornerScrewPositions.backLeft.bottom1[1]],
      right: [clearPlateScrewPositions.backRight[0] - conrerScrewMagicNumber, cornerScrewPositions.backRight.bottom1[1]],
    },
    left: {
      front: [clearPlateScrewPositions.frontLeft[0], clearPlateScrewPositions.frontLeft[1] - conrerScrewMagicNumber],
      back: [clearPlateScrewPositions.backLeft[0], cornerScrewPositions.backLeft.bottom1[1] + conrerScrewMagicNumber],
    },
    right: {
      front: [clearPlateScrewPositions.frontRight[0], clearPlateScrewPositions.frontRight[1] - conrerScrewMagicNumber],
      back: [clearPlateScrewPositions.backRight[0], cornerScrewPositions.backRight.bottom1[1] + conrerScrewMagicNumber],
    },
  };

  // We need to insall neutrik connectors / 24mm button on the front side panel.
  // 2mm is added for a bit of clearance.
  const d = Math.max(minDepth, 26 + 0.1 + 2, buttonSpec.obsf24.outerRadius + 2);

  let requriedCornerLayers = Math.ceil((d - clearPlateThickness) / plateThickness) - 1;
  if (requriedCornerLayers % 2 === 0) {
    requriedCornerLayers += 1;
  }

  const sidePlateScrewLayers = requriedCornerLayers >= 7 ? [1, requriedCornerLayers - 2] : [(requriedCornerLayers - 1) / 2];

  const clearPlateWidth = width - borders - borders;
  const clearPlateHeight = height - borders - borders - palmRest;

  return {
    ...config,
    requriedCornerLayers,
    innerRadius: config.borderRadius - config.borders,
    centerX,
    centerY,
    clearPlateWidth,
    clearPlateHeight,
    clearPlateScrewPositions,
    conrerScrewMagicNumber,
    cornerScrewPositions,
    sidePlateScrewPositions,
    sidePlateScrewLayers,
    isClearPlateBackScrewCloserToCenterThanCornerScrew,
    isClearPlateBackScrewCloserToBackThanFront,
  };
}

let currentUserConfig: Config = presets[0].config;
let currentConfig = computeConfig(currentUserConfig);

export const computeAndSetConfig = (newConfig: Partial<Config>) => {
  currentUserConfig = {...currentUserConfig, ...newConfig};
  currentConfig = computeConfig(currentUserConfig);
  return currentConfig;
};

export type ComputedConfig = ReturnType<typeof computeConfig>;

export const setComputedConfig = ({
  changedConfig,
  computedConfig,
}: {
  changedConfig?: Partial<Config>;
  computedConfig?: ComputedConfig;
}) => {
  if (changedConfig) {
    currentUserConfig = {...currentUserConfig, ...changedConfig};
  }

  if (computedConfig) {
    currentConfig = computedConfig;
  }
};

export const getConfig = () => currentConfig;
export const getUserConfig = () => currentUserConfig;
