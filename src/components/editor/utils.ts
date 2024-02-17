import {useEffect, useState} from 'react';
import {type z} from 'zod';

export function useValidateInputValue<T>(onValidateInputChange: (value: T) => void, validateInput: T, schema: z.ZodType<T>) {
  const [inputValue, setInputValue] = useState<Record<keyof T, any>>(validateInput);
  const [errors, setErrors] = useState<z.typeToFlattenedError<any> | undefined>();

  useEffect(() => {
    const result = schema.safeParse(inputValue);
    if (result.success) {
      setErrors(undefined);
      onValidateInputChange(result.data);
    } else {
      const errors = result.error.flatten();
      setErrors(errors);
    }
  }, [inputValue]);

  return {inputValue, setInputValue, errors};
}
