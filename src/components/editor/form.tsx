import React, {useCallback, useEffect, useRef, useState} from 'react';
import {schema, type Config, type LayoutItem, refinedSchema} from '@schema';
import {type z} from 'zod';
import {NumberField} from './fields';
import {LayoutItemField, getFormItemFromZodType} from './layout';
import {useValidateInputValue} from './utils';

let layoutItemKey = 0;

function getLayoutItemMapFromConfig(config: Config) {
  const map: Record<string, LayoutItem> = {};

  for (const layoutItem of config.layout) {
    const key = String(layoutItemKey++);
    map[key] = layoutItem;
  }

  return map;
}

const baseFields = [
  'width',
  'height',
  'borders',
  'palmRest',
  'borderRadius',
  'cornersPlateThickness',
  'frontPlateThickness',
  'backPlateThickness',
  'leftRightPlateThickness',
  'clearPlateScrewOffset',
  'minDepth',
  'clearPlateThickness',
  'layoutOffsetX',
  'layoutOffsetY',
] as const;

type EditorFormProps = {
  config: Config;
  onConfigChange: (config: Config) => void;
  onErrorsChange: (errors: z.typeToFlattenedError<Config> | undefined) => void;
};

export const EditorForm: React.FC<EditorFormProps> = ({config, onConfigChange, onErrorsChange}) => {
  const {inputValue, setInputValue, errors} = useValidateInputValue<Config>(onConfigChange, config, refinedSchema);

  const isInitialMount = useRef(true);

  const onBaseFieldsChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as HTMLInputElement;
    setInputValue(s => ({
      ...s,
      [target.name]: target.value,
    }));
  }, []);

  const [layoutItemState, setLayoutItemState] = useState<Record<string, LayoutItem>>(getLayoutItemMapFromConfig(inputValue));

  const onLayoutChange = useCallback((k: string, v: LayoutItem) => {
    setLayoutItemState(s => ({...s, [k]: v}));
  }, []);

  const onLayoutItemAdd = useCallback(() => {
    const key = String(layoutItemKey++);
    setLayoutItemState(s => ({...s, [key]: {x: 0, y: 0, t: 'obsf24', isBelow: false}}));
  }, []);

  const onLayoutItemRemove = useCallback((k: string) => {
    setLayoutItemState(s => {
      const nextState = {...s};
      delete nextState[k]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      return nextState;
    });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    setInputValue(s => ({
      ...s,
      layout: Object.keys(layoutItemState).sort().map(k => ({
        ...layoutItemState[k],
        x: layoutItemState[k].x,
        y: layoutItemState[k].y,
      })),
    }));
  }, [layoutItemState]);

  useEffect(() => {
    onErrorsChange(errors);
  }, [errors, onErrorsChange]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const BaseInputFields = baseFields.map(key => {
    const value = inputValue[key] as number;
    const itemShape = schema.shape[key];
    const item = getFormItemFromZodType(itemShape, key);

    return (
      <NumberField
        key={key}
        onChange={onBaseFieldsChange}
        value={value}
        item={item}
        isError={Boolean(errors?.fieldErrors[key])}
      />
    );
  });

  // Format the base fields into a grid
  const ItemsInColumn = 4;

  const BaseFieldsInGrid: JSX.Element[][] = [];

  for (let i = 0; i < baseFields.length; i++) {
    const f = BaseInputFields[i];
    if (i % ItemsInColumn === 0) {
      BaseFieldsInGrid.push([f]);
    } else {
      const lastRow = BaseFieldsInGrid.at(-1);
      lastRow?.push?.(f);
    }

    if (i === baseFields.length - 1) {
      const left = (i - 1) % ItemsInColumn;

      if (left !== 0) {
        for (let l = 0; l < left; l++) {
          BaseFieldsInGrid.at(-1)?.push?.(<div key={`grid-placeholder-${l}`} />);
        }
      }
    }
  }

  return (
    <>
      <h6>
        Edit basic parameters of the fightstick enclosure.
      </h6>
      {BaseFieldsInGrid.map((row, i) => (
        <div key={i} className='grid'>
          {row}
        </div>
      ))}
      <h6>
        Edit positions of Layout Items, such as buttons / sticks / brook pcb.
      </h6>
      {Object.keys(layoutItemState).map(k => (
        <LayoutItemField
          key={k}
          uniqueKey={k}
          value={layoutItemState[k]}
          onChange={onLayoutChange}
          onBtnClick={onLayoutItemRemove}
          btnLabel='Remove'
        />
      ))}
      <button onClick={onLayoutItemAdd}>Add Layout Item</button>
    </>
  );
};
