import React, {useCallback, useEffect, useRef} from 'react';
import {schema, type Config, refinedSchema} from '@schema';
import {type z} from 'zod';
import {BooleanField, NumberField} from './fields';
import {getFormItemFromZodType, useValidateInputValue} from './utils';

// Let layoutItemKey = 0;

// function getLayoutItemMapFromConfig(config: Config) {
//   const map: Record<string, LayoutItem> = {};

//   for (const layoutItem of config.layout) {
//     const key = String(layoutItemKey++);
//     map[key] = layoutItem;
//   }

//   return map;
// }

const baseNumberFields = [
  'width',
  'height',
  'borders',
  'palmRest',
  'borderRadius',
  'cornersPlateThickness',
  'frontPlateThickness',
  'backPlateThickness',
  'leftRightPlateThickness',
  'clearPlateThickness',
  'clearPlateScrewOffset',
  'minDepth',
  'layoutOffsetX',
  'layoutOffsetY',
  'leftOptionButtonsNumber',
  'rightOptionButtonsNumber',
] as const;

const baseBooleanFields = ['mergeFrontBackCorners'] as const;

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
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setInputValue(s => ({
      ...s,
      [target.name]: value,
    }));
  }, []);

  // Const [layoutItemState, setLayoutItemState] = useState<Record<string, LayoutItem>>(getLayoutItemMapFromConfig(inputValue));

  // const onLayoutChange = useCallback((k: string, v: LayoutItem) => {
  //   setLayoutItemState(s => ({...s, [k]: v}));
  // }, []);

  // const onLayoutItemAdd = useCallback(() => {
  //   const key = String(layoutItemKey++);
  //   setLayoutItemState(s => ({...s, [key]: {x: 0, y: 0, t: 'obsf24', isBelow: false}}));
  // }, []);

  // const onLayoutItemRemove = useCallback((k: string) => {
  //   setLayoutItemState(s => {
  //     const nextState = {...s};
  //     delete nextState[k]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
  //     return nextState;
  //   });
  // }, []);

  // useEffect(() => {
  //   if (isInitialMount.current) {
  //     return;
  //   }

  //   setInputValue(s => ({
  //     ...s,
  //     layout: Object.keys(layoutItemState).sort().map(k => ({
  //       ...layoutItemState[k],
  //       x: layoutItemState[k].x,
  //       y: layoutItemState[k].y,
  //     })),
  //   }));
  // }, [layoutItemState]);

  useEffect(() => {
    onErrorsChange(errors);
  }, [errors, onErrorsChange]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Format the base fields into a grid
  const ItemsInColumn = 4;

  const BaseFieldsInGrid: JSX.Element[][] = [];

  // Add the base number fields into the grid
  for (const [i, key] of baseNumberFields.entries()) {
    const value = inputValue[key] as number;
    const itemShape = schema.shape[key];
    const item = getFormItemFromZodType(itemShape, key);

    const child = (
      <NumberField
        key={key}
        onChange={onBaseFieldsChange}
        value={value}
        item={item}
        isError={Boolean(errors?.fieldErrors[key])}
      />
    );

    if (i % ItemsInColumn === 0) {
      BaseFieldsInGrid.push([child]);
    } else {
      const lastRow = BaseFieldsInGrid.at(-1);
      lastRow?.push?.(child);
    }
  }

  // Add the base boolean fields into the grid
  for (const [i, key] of baseBooleanFields.entries()) {
    const value = inputValue[key] as boolean;
    const itemShape = schema.shape[key];
    const item = getFormItemFromZodType(itemShape, key);

    const child = (
      <BooleanField
        key={key}
        onChange={onBaseFieldsChange}
        value={value}
        item={item}
        isError={Boolean(errors?.fieldErrors[key])}
      />
    );

    if (i % ItemsInColumn === 0) {
      BaseFieldsInGrid.push([child]);
    } else {
      const lastRow = BaseFieldsInGrid.at(-1);
      lastRow?.push?.(child);
    }
  }

  // Fill the last row with placeholders
  const lastRowItems = BaseFieldsInGrid.at(-1)?.length ?? 0 - 1;

  if (lastRowItems > 0) {
    const left = (lastRowItems - 1) % ItemsInColumn;

    if (left !== 0) {
      for (let l = 0; l < left; l++) {
        BaseFieldsInGrid.at(-1)?.push?.(<div key={`grid-placeholder-${l}`} />);
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
      {/* <h6>
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
      <button onClick={onLayoutItemAdd}>Add Layout Item</button> */}
    </>
  );
};
