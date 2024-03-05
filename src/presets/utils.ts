import {hitbox} from '@layouts/hitbox';
import {type Config} from '@schema';

const defaultConfig: Config = {
  width: 406,
  height: 250,
  borders: 2,
  palmRest: 80,
  borderRadius: 10,
  cornersPlateThickness: 4.7,
  frontPlateThickness: 4.7,
  backPlateThickness: 4.7,
  leftRightPlateThickness: 4.7,
  clearPlateScrewOffset: 22,
  minDepth: 34,
  clearPlateThickness: 3.5,
  layout: hitbox,
  layoutOffsetX: 0,
  layoutOffsetY: 0,
  leftOptionButtonsNumber: 2,
  rightOptionButtonsNumber: 2,
};

export function createPreset(id: string, name: string, config: Partial<Config>) {
  return {id, name, config: {...defaultConfig, ...config}};
}
