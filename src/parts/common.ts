import {model, models, chain, type IModel} from 'makerjs';
import {filletG2Continunity} from '@helpers/fillet';
import {getConfig} from '@config';

type FilletedResult = {
  straightLines: IModel;
  filletArc: IModel;
};

const cache = new Map<string, FilletedResult>();

function getFilletResultWithCache(width: number, height: number, borderRadius: number) {
  const key = `${width}-${height}-${borderRadius}`;
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const dimension = new models.Rectangle(width, height);
  const c = model.findSingleChain(dimension);
  const filletArc = filletG2Continunity(c, borderRadius, 0.5);

  const result = {straightLines: chain.toNewModel(c), filletArc};

  cache.set(key, result);

  return result;
}

export function common() {
  const config = getConfig();
  return getFilletResultWithCache(config.width, config.height, config.borderRadius);
}
