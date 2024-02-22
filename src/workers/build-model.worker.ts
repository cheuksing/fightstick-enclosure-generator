import {type Config} from '@schema';
import {buildModelTree} from '@tree/model';

self.onmessage = async (event: MessageEvent) => { // eslint-disable-line unicorn/prefer-add-event-listener
  const config = event.data as Config;

  try {
    const {computedConfig, tree} = buildModelTree(config);
    postMessage({config, computedConfig, tree});
  } catch (error) {
    console.error(error);
    postMessage({error});
  }
};
