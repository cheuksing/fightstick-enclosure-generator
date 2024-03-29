import React, {Suspense, useCallback, useEffect, useRef} from 'react';
import {schema, type Config, refinedSchema, type Layout} from '@schema';
import {type z} from 'zod';
import {BooleanField, NumberField} from './fields';
import {getFormItemFromZodType, useValidateInputValue} from './utils';

const ImportDxfButton = React.lazy(async () => import('./dxf-button'));

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

  const onLayoutChange = useCallback((layout: Layout) => {
    console.log('layout', layout);
    setInputValue(s => ({
      ...s,
      layout,
    }));
  }, []);

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
      <h4>
        Edit basic parameters of the fightstick enclosure.
      </h4>
      {BaseFieldsInGrid.map((row, i) => (
        <div key={i} className='grid'>
          {row}
        </div>
      ))}
      <h4>
        Edit positions of Layout Items, such as buttons / sticks / brook pcb.
      </h4>
      <h5>
        You can import a DXF file to set the layout items.
        The layout items will be centered to the dxf origin.
      </h5>
      <h6>
        Item must put in these specific layers:<br /><br />
        &emsp;<ins>button</ins>: circles with diameter of 24mm or 30mm.<br /><br />
        &emsp;<ins>stick</ins>: circle which refer to the center of the stick.<br /><br />
        &emsp;<ins>brook</ins>: a 100mm * 50mm or 50mm * 100mm rectangle.<br /><br />
      </h6>

      <Suspense fallback={<button>Import DXF</button>}>
        <ImportDxfButton onChange={onLayoutChange} />
      </Suspense>
      {/* {Object.keys(layoutItemState).map(k => (
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
      <p />
    </>
  );
};
