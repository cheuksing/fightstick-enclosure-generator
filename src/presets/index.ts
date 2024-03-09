import {crossupPreset} from './crossup';
import {hitboxPreset} from './hitbox';

export const presets = [
  hitboxPreset,
  crossupPreset,
];

export const presetsMap = Object.fromEntries(presets.map(preset => [preset.id, preset]));
