import {crossup} from '@layouts/crossup';
import {createPreset} from './utils';

export const crossupPreset = createPreset('hitboxCrossup', 'Hitbox Cross-up', {
  layout: crossup,
  width: 450,
  height: 250,
  palmRest: 60,
  layoutOffsetY: -30,
});
