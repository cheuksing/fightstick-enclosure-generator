/* eslint-disable @typescript-eslint/naming-convention */

import {value} from 'vite/client';
import type {IModel} from 'makerjs';
import type {LayoutItem} from '@schema';

declare global {
  declare module '*.md' {
    // "unknown" would be more detailed depends on how you structure frontmatter
    const attributes: Record<string, unknown>;

    // When "Mode.TOC" is requested
    const toc: Array<{level: string; content: string}>;

    // When "Mode.HTML" is requested
    const html: string;

    // When "Mode.RAW" is requested
    const raw: string;

    // When "Mode.React" is requested. VFC could take a generic like React.VFC<{ MyComponent: TypeOfMyComponent }>
    import type React from 'react';

    const ReactComponent: React.VFC;

    // When "Mode.Vue" is requested
    import {type ComponentOptions, type Component} from 'vue';

    const VueComponent: ComponentOptions;
    const VueComponentWith: (components: Record<string, Component>) => ComponentOptions;

    // Modify below per your usage
    export {attributes, toc, html, ReactComponent, VueComponent, VueComponentWith};
  }

  declare module '*.dxf' {
    const content: LayoutItem[];
    export default content;
  }

}
