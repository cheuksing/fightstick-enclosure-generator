import {crossup} from '@layouts/crossup';
import {createPreset} from './utils';

export const crossupPreset = createPreset('hitboxCrossup', 'Hitbox Cross-up', {
  layout: [...crossup, {x: -200, y: 0, t: 'brook'}],
  width: 450,
  height: 250,
  palmRest: 60,
  layoutOffsetY: -30,
});
