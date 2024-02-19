import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {layoutItemSchema, type LayoutItem} from '@schema';
import {z} from 'zod';
import {BooleanField, EnumField, NumberField} from './fields';

type ScheamZodType = z.ZodNumber | z.ZodEnum<[string, ...string[]]> | z.ZodOptional<z.ZodBoolean>;

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

const shapeX = layoutItemSchema.shape.x;
const shapeY = layoutItemSchema.shape.y;
const shapeT = layoutItemSchema.shape.t;
const shapeIsBelow = layoutItemSchema.shape.isBelow;
const itemX = getFormItemFromZodType(shapeX, 'x');
const itemY = getFormItemFromZodType(shapeY, 'y');
const itemT = getFormItemFromZodType(shapeT, 't');
const itemIsBelow = getFormItemFromZodType(shapeIsBelow, 'isBelow');

type LayoutItemProps = {
  uniqueKey: string;
  value: LayoutItem;
  onChange: (key: string, v: LayoutItem) => void;
  onBtnClick: (key: string) => void;
  btnLabel: React.ReactNode;
};

const buttonsKeys = new Set(['obsf24', 'obsf30']);

export const LayoutItemField: React.FC<LayoutItemProps> = ({uniqueKey, value, onChange, onBtnClick, btnLabel}) => {
  const [state, setState] = useState<LayoutItem>(value);

  const onItemChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement;
    const nextState = {
      ...state,
      [target.name]: target.type === 'checkbox' ? target.checked : target.value,
    };

    if (!buttonsKeys.has(nextState.t)) {
      delete nextState.isBelow;
    }

    setState(nextState);
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    onChange(uniqueKey, state);
  }, [uniqueKey, value, state, onChange]);

  const onClick = useCallback(() => {
    onBtnClick(uniqueKey);
  }, [uniqueKey, onBtnClick]);

  const isErrors = useMemo(() => {
    const result = layoutItemSchema.safeParse(state);
    if (result.success) {
      return new Set([]);
    }

    const errors = Object.keys(result.error.flatten().fieldErrors ?? {});
    return new Set(errors);
  }, [state]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <div className='layout-item-container'>
      <NumberField
        item={itemX}
        value={state.x}
        onChange={onItemChange}
        isError={isErrors.has('x')}
      />
      <NumberField
        item={itemY}
        value={state.y}
        onChange={onItemChange}
        isError={isErrors.has('y')}
      />
      <EnumField
        item={itemT}
        value={state.t}
        onChange={onItemChange}
        isError={isErrors.has('t')}
      />
      {buttonsKeys.has(value.t)
        ? <BooleanField
          className='layout-item-offset-top'
          item={itemIsBelow}
          value={state.isBelow ?? false}
          onChange={onItemChange}
          isError={isErrors.has('isBelow')}
        />
        : <div />
      }
      <label className='layout-item-offset-top' >
        <button onClick={onClick}>{btnLabel}</button>
      </label>
    </div>
  );
};
