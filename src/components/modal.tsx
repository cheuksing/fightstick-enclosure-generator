import React, {useCallback, useLayoutEffect} from 'react';

type ModalProps = {
  title: string;
  content: React.ReactNode;
};

export function Modal({title, content}: ModalProps) {
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  const onBack = useCallback(() => {
    history.back();
  }, []);

  return (
    <dialog open>
      <article>
        <header>
          <a
            className='close'
            aria-label='Close'
            onClick={onBack}
          />
          <p>
            <strong>{title}</strong>
          </p>
        </header>
        {content}
      </article>
    </dialog>
  );
}
