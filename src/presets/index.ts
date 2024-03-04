import {allButtonCrossupPreset} from './all-button-crossup';
import {crossupPreset} from './crossup';
import {hitboxPreset} from './hitbox';

export const presets = [
  hitboxPreset,
  crossupPreset,
  allButtonCrossupPreset,
];

export const presetsMap = Object.fromEntries(presets.map(preset => [preset.id, preset]));
