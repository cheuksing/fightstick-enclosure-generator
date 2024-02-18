import {hitbox} from '@layouts/hitbox';
import {createPreset} from './utils';

export const hitboxPreset = createPreset('hitbox', 'Original Hitbox', {
  layout: [...hitbox, {x: -115, y: -60, t: 'brook'}],
});
