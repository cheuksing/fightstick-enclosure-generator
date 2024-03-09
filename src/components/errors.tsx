import React from 'react';
import {type z} from 'zod';

type ErrorsProps = {
  errors: z.typeToFlattenedError<any> | undefined;
};

export const Errors: React.FC<ErrorsProps> = ({errors}) => (
  <article className={`errors-container ${errors ? 'error' : ''}`}>
    {errors ? (
      <>
        {errors.formErrors
          ? errors.formErrors.map((errorString, x) => (
            <div key={x}>{errorString.split('\n').map((s, i) => (<React.Fragment key={i}>{i !== 0 && <br />}{s}</React.Fragment>))}</div>
          ))
          : null}
        {Object.keys(errors.fieldErrors || {}).flatMap(key => {
          const strs = errors.fieldErrors[key];
          if (!strs) {
            return null;
          }

          return strs.map((string_, j) => (
            <div key={`${key}_${j}`}>{`${key}: ${string_}`}</div>
          ));
        })}
      </>
    ) : 'No errors in current config.'}
  </article>
);
