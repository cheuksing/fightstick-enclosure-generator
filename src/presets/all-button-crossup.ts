import {allButtonCrossup} from '@layouts/all-button-crossup';
import {createPreset} from './utils';

export const allButtonCrossupPreset = createPreset('allButtonCrossup', 'All Buttons Hitbox Cross-up', {
  layout: [...allButtonCrossup, {x: -120, y: -30, t: 'brook'}],
  width: 450,
  height: 190,
  palmRest: 0,
  layoutOffsetY: -30,
});
