import {LayerName, svgLayerOptions} from '@helpers/color';
import {type IModel} from 'makerjs';

export function previewModelTree(tree: IModel) {
  tree.exporterOptions = {
    toSVG: { // eslint-disable-line @typescript-eslint/naming-convention
      layerOptions: {
        [LayerName.artworkReference]: svgLayerOptions[LayerName.artworkReference],
      },
    },
  };

  return tree;
}
