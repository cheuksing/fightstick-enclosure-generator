import {exporter} from 'makerjs';

const dxfColors = exporter.colors;

export enum LayerName {
  m3 = 'm3',
  m4 = 'm4',
  m3Countersunk = 'm3 Countersunk',
  m4Countersunk = 'm4 Countersunk',
  topPlateBorder = 'Top Plate Border',
  bottomPlateBorder = 'Bottom Plate Border',
  artworkReference = 'Artwork Reference',
}

export enum LayerColor {
  aqua = 'aqua',
  black = 'black',
  blue = 'blue',
  fuchsia = 'fuchsia',
  green = 'green',
  gray = 'gray',
  lime = 'lime',
  maroon = 'maroon',
  navy = 'navy',
  olive = 'olive',
  orange = 'orange',
  purple = 'purple',
  red = 'red',
  silver = 'silver',
  teal = 'teal',
  white = 'white',
  yellow = 'yellow',
}

const layerOptions = {
  [LayerName.m3]: LayerColor.white,
  [LayerName.m4]: LayerColor.lime,
  [LayerName.m3Countersunk]: LayerColor.orange,
  [LayerName.m4Countersunk]: LayerColor.red,
  [LayerName.topPlateBorder]: LayerColor.fuchsia,
  [LayerName.bottomPlateBorder]: LayerColor.fuchsia,
  [LayerName.artworkReference]: LayerColor.yellow,
} as const;

export const dxfLayerOptions = (() => {
  const temporary: Record<string, {color: number}> = {};

  for (const [key, value] of Object.entries(layerOptions)) {
    temporary[key] = {color: dxfColors[value]};
  }

  return temporary;
})();

export const svgLayerOptions = (() => {
  const temporary: Record<string, {stroke: string}> = {};

  for (const [key, value] of Object.entries(layerOptions)) {
    temporary[key] = {stroke: value};
  }

  return temporary;
})();
