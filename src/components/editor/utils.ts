import {useCallback, useEffect, useRef, useState} from 'react';
import {type z} from 'zod';

export function useValidateInputValue<T>(onValidateInputChange: (value: T) => void, defaultInputValue: T, schema: z.ZodType<T>) {
  const isInitialMount = useRef(true);
  const [inputValue, setInputValue] = useState<Record<keyof T, any>>(defaultInputValue);
  const [errors, setErrors] = useState<z.typeToFlattenedError<any> | undefined>();

  const onUpdate = useCallback((s: typeof inputValue) => {
    const result = schema.safeParse(s);
    if (result.success) {
      setErrors(undefined);
      onValidateInputChange(result.data);
    } else {
      const errors = result.error.flatten();
      setErrors(errors);
    }
  }, [schema, onValidateInputChange]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    onUpdate(inputValue);
  }, [inputValue]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return {inputValue, setInputValue, errors};
}
