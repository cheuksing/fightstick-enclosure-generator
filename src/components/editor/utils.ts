import {useCallback, useEffect, useRef, useState} from 'react';
import {z} from 'zod';

type ScheamZodType = z.ZodNumber | z.ZodEnum<[string, ...string[]]> | z.ZodOptional<z.ZodBoolean> | z.ZodBoolean;

export function getFormItemFromZodType(shape: ScheamZodType, key: string) {
  if (shape._def.typeName === z.ZodFirstPartyTypeKind.ZodEnum) {
    return {
      key,
      type: 'select',
      desc: shape.description,
      options: ('options' in shape ? shape.options : []) as string[],
      isOptional: false,
    };
  }

  if (shape._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional) {
    return {
      key,
      type: 'checkbox',
      desc: shape.description,
      isOptional: true,
    };
  }

  if (shape._def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean) {
    return {
      key,
      type: 'checkbox',
      desc: shape.description,
      isOptional: false,
    };
  }

  if (shape._def.typeName === z.ZodFirstPartyTypeKind.ZodNumber) {
    return {
      key,
      type: 'number',
      desc: shape.description,
      isOptional: false,
    };
  }

  throw new Error('Unknown type');
}

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
