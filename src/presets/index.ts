import {allButtonCrossupPreset} from './all-button-crossup';
import {crossupPreset} from './crossup';
import {hitboxPreset} from './hitbox';
import {splitShiokenWithExtraButton} from './split-shiokenstar-with-extra-button';

export const presets = [
  hitboxPreset,
  crossupPreset,
  allButtonCrossupPreset,
  splitShiokenWithExtraButton,
];

export const presetsMap = Object.fromEntries(presets.map(preset => [preset.id, preset]));
