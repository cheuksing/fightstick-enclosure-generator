import hitbox from './dxf/hitbox.dxf';
import {createPreset} from './utils';

export const hitboxPreset = createPreset('hitbox', 'Original Hitbox', {
  layout: hitbox,
});
