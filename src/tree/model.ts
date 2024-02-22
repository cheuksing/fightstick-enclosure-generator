import {corners} from '@parts/corner';
import {clearPlate} from '@parts/clear-plate';
import {sidePlates} from '@parts/side-plate';
import {bottomPlate} from '@parts/bottom-plate';
import {topPlate} from '@parts/top-plate';
import {computeAndSetConfig} from '@config';
import {type Config} from '@schema';

export function buildModelTree(config: Config) {
  const computedConfig = computeAndSetConfig(config); // Compute config

  const tree = {
    models: {
      corners: corners(),
      sidePlates: sidePlates(),
      clearPlate: clearPlate(),
      topPlate: topPlate(),
      bottomPlate: bottomPlate(),
    },
  };

  return {tree, computedConfig};
}

export type ModelTree = ReturnType<typeof buildModelTree>['tree'];
