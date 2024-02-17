import {model, type IModel} from 'makerjs';
import {getConfig} from '@config';

export function mirrorX <T extends IModel>(modelToMirror: T): T {
  const {height} = getConfig();
  let m = model.clone(modelToMirror);
  model.moveRelative(m, [0, -height / 2]);
  m = model.mirror(m, false, true);
  model.moveRelative(m, [0, height / 2]);
  return m as T;
}

export function mirrorY <T extends IModel>(modelToMirror: T): T {
  const {width} = getConfig();
  let m = model.clone(modelToMirror);
  model.moveRelative(m, [-width / 2, 0]);
  m = model.mirror(m, true, false);
  model.moveRelative(m, [width / 2, 0]);
  return m as T;
}
