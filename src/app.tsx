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
import {presets} from '@presets';

export function App() {
  const [config, setConfig] = useState<Config>(presets[0].config);
  const [debouncedConfig] = useDebounce(config, 1000);
  const [viewMode, setViewMode] = useState<'preview' | 'cad'>('preview');
  const [debouncedViewMode] = useDebounce(viewMode, 300);

  const tree = useMemo(() => buildModelTree(debouncedConfig), [debouncedConfig]);

  const [path, navigate] = useLocation();

  const [match, parameters] = useRoute('/preset/:id');

  useEffect(() => {
    if (!match) {
      return;
    }

    const id = parameters.id;
    if (!id) {
      return;
    }

    const hit = presets.find(preset => preset.id === id);

    if (!hit) {
      navigate('/', {replace: true});
      return;
    }

    setConfig(hit.config);
    window.scrollTo(0, 0);
  }, [path]); // Only run when route changes

  return (
    <div>
      <Nav />
      <Canvas mode={debouncedViewMode} tree={tree} config={debouncedConfig} />
      <div className='container'>
        <Content config={config} tree={tree} viewMode={viewMode} onViewModeChange={setViewMode} />
        <Editor config={config} onConfigChange={setConfig} />
      </div>
      <Route path='/guides/:id' component={Guides} />
    </div>
  );
}

