import {useEffect} from 'react';
import {type ModelTree} from '@tree/model';
import {type Config} from '@schema';
import {useDebounce} from 'use-debounce';

import BuildModelTreeWorker from './build-model.worker?worker';
import {type ComputedConfig, setComputedConfig} from '@config';

const buildModelTreeWorker = new BuildModelTreeWorker();

type BuildModelWorkerProps = {
  config: Config;
  onTreeChange: (tree: ModelTree | undefined) => void;
};

export function BuildModelWorker({config, onTreeChange}: BuildModelWorkerProps) {
  useEffect(() => {
    const fn = (event: MessageEvent) => {
      const data = event.data as {config: Config; computedConfig: ComputedConfig; tree: ModelTree} | {error: Error};

      if ('error' in data) {
        console.error(data.error);
        onTreeChange(undefined);
        return;
      }

      const {config, computedConfig, tree} = data;
      setComputedConfig({changedConfig: config, computedConfig});
      onTreeChange(tree);
    };

    buildModelTreeWorker.addEventListener('message', fn);

    return () => {
      buildModelTreeWorker.removeEventListener('message', fn);
    };
  }, [onTreeChange]);

  useEffect(() => {
    buildModelTreeWorker.postMessage(config);
  }, [config]);

  return null;
}

