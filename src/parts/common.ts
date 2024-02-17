import {model, models, chain} from 'makerjs';
import {filletG2Continunity} from '@helpers/fillet';
import {getConfig} from '@config';

export function common() {
  const config = getConfig();
  const dimension = new models.Rectangle(config.width, config.height);
  const c = model.findSingleChain(dimension);
  const filletArc = filletG2Continunity(c, config.borderRadius, 0.5);

  return {
    models: {straightLines: chain.toNewModel(c), filletArc},
  };
}
