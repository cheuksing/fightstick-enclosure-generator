import {hitbox} from '@layouts/hitbox';
import {createPreset} from './utils';

export const hitboxPreset = createPreset('hitbox', 'Original Hitbox', {
  layout: [...hitbox, {x: 0, y: 0, t: 'brook'}],
});
