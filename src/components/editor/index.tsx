import React, {Suspense, useEffect, useRef, useState} from 'react';
import {type Config} from '@schema';
import {type z} from 'zod';
import {Errors} from '../errors';
import {Tabs} from '../tabs';

const EditorForm = React.lazy(async () => import('./form').then(module => ({default: module.EditorForm})));
const EditorJson = React.lazy(async () => import('./json').then(module => ({default: module.EditorJson})));

type EditorProps = {
  presetConfig: Config;
  onConfigChange: (config: Config) => void;
};

const editorTabs = [
  {id: 'form', title: 'Form'},
  {id: 'raw', title: 'Raw Data'},
];

export const Editor: React.FC<EditorProps> = ({presetConfig, onConfigChange}) => {
  const [currentTab, setCurrentTab] = useState(editorTabs[0].id);
  const [errors, setErrors] = useState<z.typeToFlattenedError<any> | undefined>();

  const [value, onChange] = useState<Config>(presetConfig);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    onChange(presetConfig);
  }, [presetConfig]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    onConfigChange(value);
  }, [value]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <div>
      <Errors errors={errors} />
      <Tabs tabs={editorTabs} currentTab={currentTab} onTabChange={setCurrentTab} />
      <Suspense fallback={null}>
        {currentTab === 'form' && <EditorForm config={value} onConfigChange={onChange} onErrorsChange={setErrors} />}
        {currentTab === 'raw' && <EditorJson config={value} onConfigChange={onChange} onErrorsChange={setErrors} />}
      </Suspense>
    </div>
  );
};
