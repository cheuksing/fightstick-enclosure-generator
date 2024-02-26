import {buttonLayout} from '@layouts/split-shiokenstar-with-extra-button';
import {createPreset} from './utils';

export const splitShiokenWithExtraButton = createPreset('split-shiokenstar-with-extra-button', 'Split shiokenstar With Extra Button', {
  layout: [...buttonLayout, {x: -60, y: -35, t: 'brook'}],
  width: 570,
  height: 140,
  palmRest: 0,
  layoutOffsetY: -10,
});
