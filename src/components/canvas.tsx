import Blueprint from 'react-blueprint-svg';
import {type buildModelTree, previewModelTree, cadModelTree} from '@tree';
import React, {useMemo} from 'react';
import {type Config} from '@schema';

type CanvasProps = {
  mode: 'preview' | 'cad';
  config: Config;
  tree: ReturnType<typeof buildModelTree>;
};

export const Canvas: React.FC<CanvasProps> = ({mode, tree, config}) => {
  const model = useMemo(() => {
    if (mode === 'cad') {
      return cadModelTree(tree, config);
    }

    return previewModelTree(tree);
  }, [tree, mode]);

  return (
    <div className='canvas-container'>
      <Blueprint model={model} options={{fitOnScreen: true}} />
    </div>
  );
};
