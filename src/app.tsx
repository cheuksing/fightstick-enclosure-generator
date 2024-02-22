import {Canvas} from './components/canvas';
import {Editor} from './components/editor';
import {Suspense, lazy, useMemo, useState} from 'react';
import {type ModelTree} from '@tree/model';
import {type Config} from '@schema';
import {useDebounce} from 'use-debounce';
import {Nav} from './components/nav';
import {Content} from './components/content';
import {useRoute, Route, useLocation} from 'wouter';
import {presets, presetsMap} from '@presets';

const Guides = lazy(async () => import('./guides').then(module => ({default: module.Guides})));
const BuildModelWorker = lazy(async () => import('./workers/build-model-worker').then(module => ({default: module.BuildModelWorker})));

const defaultPreset = presets[0].id;

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
      <Suspense fallback={null}>
        <BuildModelWorker config={debouncedConfig} onTreeChange={setTree} />
      </Suspense>
      <Suspense fallback={null}>
        <Route path='/guides/:id' component={Guides} />
      </Suspense>
    </div>
  );
}

