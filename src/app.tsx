import {Canvas} from './components/canvas';
import {Editor} from './components/editor';
import {useEffect, useMemo, useState} from 'react';
import {buildModelTree} from '@tree';
import {type Config} from '@schema';
import {useDebounce} from 'use-debounce';
import {Nav} from './components/nav';
import {Content} from './components/content';
import {useRoute, Route, useLocation} from 'wouter';
import {Guides} from '@guides';
import {presets, presetsMap} from '@presets';

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

  const tree = useMemo(() => buildModelTree(debouncedConfig), [debouncedConfig]);

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

