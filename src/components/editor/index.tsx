import React, {useState} from 'react';
import {type Config} from '@schema';
import {type z} from 'zod';
import {Errors} from '../errors';
import {EditorForm} from './form';
import {Tabs} from '../tabs';
import {EditorJson} from './json';

type EditorProps = {
  config: Config;
  onConfigChange: (config: Config) => void;
};

const editorTabs = [
  {id: 'form', title: 'Form'},
  {id: 'raw', title: 'Raw Data'},
];

export const Editor: React.FC<EditorProps> = ({config, onConfigChange}) => {
  const [currentTab, setCurrentTab] = useState(editorTabs[0].id);
  const [errors, setErrors] = useState<z.typeToFlattenedError<any> | undefined>();

  return (
    <div>
      <Errors errors={errors} />
      <Tabs tabs={editorTabs} currentTab={currentTab} onTabChange={setCurrentTab} />
      {currentTab === 'form' && <EditorForm config={config} onConfigChange={onConfigChange} onErrorsChange={setErrors} />}
      {currentTab === 'raw' && <EditorJson config={config} onConfigChange={onConfigChange} onErrorsChange={setErrors} />}
    </div>
  );
};
