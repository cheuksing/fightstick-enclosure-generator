import {cadModelTree} from '@tree/cad';
import {previewModelTree} from '@tree/preview';
import {type ModelTree} from '@tree/model';
import React, {Suspense, useMemo} from 'react';
import {type Config} from '@schema';

type CanvasProps = {
  mode: 'preview' | 'cad';
  config: Config;
  tree?: ModelTree;
};

const canvasConfig = {fitOnScreen: true};

const Blueprint = React.lazy(async () => import('react-blueprint-svg'));

const MemoBlueprint = React.memo(Blueprint, (previousProps, nextProps) => previousProps.model === nextProps.model);

export const Canvas: React.FC<CanvasProps> = ({mode, tree, config}) => {
  const model = useMemo(() => {
    if (!tree) {
      return {};
    }

    if (mode === 'cad') {
      return cadModelTree(tree, config);
    }

    return previewModelTree(tree);
  }, [tree, mode]);

  return (
    <div className='canvas-container'>
      <Suspense fallback={<div />}>
        <MemoBlueprint model={model} options={canvasConfig} />
      </Suspense>
    </div>
  );
};
