import React from 'react';

type FieldProps<T extends number | string | boolean> = {
  className?: string;
  item: {
    key: string;
    type: string;
    desc?: string;
    options?: string[];
    isOptional: boolean;
  };
  value: T;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isError: boolean;
};

export const NumberField: React.FC<FieldProps<number>> = ({className, item, onChange, value, isError}) => (
  <label className={className} key={item.key}>
    <span data-tooltip={item.desc}>
      {item.key}
      <i className='gg-info' />
    </span>
    <input
      name={item.key}
      value={value}
      onChange={onChange}
      {...(isError && {'aria-invalid': 'true'})}
    />
  </label>
);

export const BooleanField: React.FC<FieldProps<boolean>> = ({className, item, onChange, value, isError}) => {
  const fallbackValue = value ?? (item.isOptional ? false : undefined);

  if (fallbackValue === undefined) {
    return <div />;
  }

  return (
    <label className={className} key={item.key}>
      <input
        name={item.key}
        role='switch'
        type='checkbox'
        checked={fallbackValue}
        onChange={onChange}
        {...(isError && {'aria-invalid': 'true'})}
      />
      <span data-tooltip={item.desc}>
        {item.key}
        <i className='gg-info' />
      </span>
    </label>
  );
};

export const EnumField: React.FC<FieldProps<string>> = ({className, item, onChange, value, isError}) => (
  <label className={className} key={item.key}>
    <span data-tooltip={item.desc}>
      {item.key}
      <i className='gg-info' />
    </span>
    <select
      name={item.key}
      value={value}
      onChange={onChange}
      {...(isError && {'aria-invalid': 'true'})}
    >
      {(item.options ?? []).map(v => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  </label>
);
