import React, {useCallback, useEffect, useState} from 'react';
import {type Config, refinedSchema} from '@schema';
import {type z} from 'zod';
import {useValidateInputValue} from './utils';

function useJsonParser(initialString: string, onErrorsChange: (errors: z.typeToFlattenedError<Config> | undefined) => void) {
  const [jsonError, setJsonError] = useState<boolean>(false);
  const [jsonString, setJsonString] = useState<string>(initialString);
  const [jsonObject, setJsonObject] = useState<unknown>({});

  useEffect(() => {
    try {
      const parsedObject = JSON.parse(jsonString) as unknown;
      setJsonObject(parsedObject);
      setJsonError(false);
    } catch {
      onErrorsChange({formErrors: ['Invalid JSON'], fieldErrors: {}});
      setJsonError(true);
    }
  }, [jsonString]);

  return {jsonString, setJsonString, jsonObject, jsonError};
}

type EditorJsonProps = {
  config: Config;
  onConfigChange: (config: Config) => void;
  onErrorsChange: (errors: z.typeToFlattenedError<Config> | undefined) => void;
};

export const EditorJson: React.FC<EditorJsonProps> = ({config, onConfigChange, onErrorsChange}) => {
  const {jsonString, setJsonString, jsonObject, jsonError} = useJsonParser(JSON.stringify(config, null, 2), onErrorsChange);

  const onInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(event.target.value);
  }, []);

  const {setInputValue, errors} = useValidateInputValue<Config>(onConfigChange, config, refinedSchema);

  useEffect(() => {
    setInputValue(jsonObject as Config);
  }, [jsonObject]);

  useEffect(() => {
    onErrorsChange(errors);
  }, [errors, onErrorsChange, jsonError]);

  return (
    <textarea
      rows={40}
      value={jsonString}
      onChange={onInputChange}
      {...(errors && {'aria-invalid': 'true'})}
    />
  );
};
