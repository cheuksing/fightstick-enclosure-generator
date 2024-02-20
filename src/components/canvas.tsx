import Blueprint from 'react-blueprint-svg';
import {previewModelTree, cadModelTree, type ModelTree} from '@tree';
import React, {useMemo} from 'react';
import {type Config} from '@schema';

type CanvasProps = {
  mode: 'preview' | 'cad';
  config: Config;
  tree?: ModelTree;
};

const canvasConfig = {fitOnScreen: true};

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
      <MemoBlueprint model={model} options={canvasConfig} />
    </div>
  );
};
