import {Canvas} from './components/canvas';
import {Editor} from './components/editor';
import {useEffect, useMemo, useState} from 'react';
import {type ModelTree} from '@tree';
import {type Config} from '@schema';
import {useDebounce} from 'use-debounce';
import {Nav} from './components/nav';
import {Content} from './components/content';
import {useRoute, Route, useLocation} from 'wouter';
import {Guides} from '@guides';
import {presets, presetsMap} from '@presets';

import BuildModelTreeWorker from './tree.worker?worker';
import {type ComputedConfig, setComputedConfig} from '@config';

const defaultPreset = presets[0].id;

const buildModelTreeWorker = new BuildModelTreeWorker();

export function App() {
  const [viewMode, setViewMode] = useState<'preview' | 'cad'>('preview');
  const [debouncedViewMode] = useDebounce(viewMode, 300);

  const [path] = useLocation();

  const [match, parameters] = useRoute('/preset/:id');

  const presetId = useMemo(() => {
    if (!match) {
      return defaultPreset;
    }

    const id = parameters.id;
    if (!id) {
      return defaultPreset;
    }

    const hit = presets.find(preset => preset.id === id);

    return hit?.id ?? defaultPreset;
  }, [path]);

  const [config, setConfig] = useState<Config>(presetsMap[presetId].config);
  const [debouncedConfig] = useDebounce(config, 300);

  const [tree, setTree] = useState<ModelTree | undefined>();

  useEffect(() => {
    const fn = (event: MessageEvent) => {
      const data = event.data as {config: Config; computedConfig: ComputedConfig; tree: ModelTree} | {error: Error};

      if ('error' in data) {
        console.error(data.error);
        setTree(undefined);
        return;
      }

      const {config, computedConfig, tree} = data;
      setComputedConfig({changedConfig: config, computedConfig});
      setTree(tree);
    };

    buildModelTreeWorker.addEventListener('message', fn);

    return () => {
      buildModelTreeWorker.removeEventListener('message', fn);
    };
  }, [setTree]);

  useEffect(() => {
    buildModelTreeWorker.postMessage(debouncedConfig);
  }, [debouncedConfig]);

  const presetConfig = useMemo(() => {
    const preset = presetsMap[presetId];
    return preset.config;
  }, [presetId]);

  return (
    <div>
      <Nav />
      <Canvas mode={debouncedViewMode} tree={tree} config={debouncedConfig} />
      <div className='container'>
        <Content config={debouncedConfig} tree={tree} viewMode={viewMode} onViewModeChange={setViewMode} />
        <Editor presetConfig={presetConfig} onConfigChange={setConfig} />
      </div>
      <Route path='/guides/:id' component={Guides} />
    </div>
  );
}

