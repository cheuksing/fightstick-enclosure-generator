import {allButtonCrossup} from '@layouts/all-button-crossup';
import {createPreset} from './utils';

export const allButtonCrossupPreset = createPreset('allButtonCrossup', 'All Buttons Hitbox Cross-up', {
  layout: allButtonCrossup,
  width: 450,
  height: 190,
  palmRest: 20,
  layoutOffsetY: -30,
});
