import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import md from 'vite-plugin-markdown';
import {parseDxfFile} from './src/utils/parse-dxf.js';

function dxfPlugin() {
  const cache = new Map();

  return {
    name: 'dxf-plugin',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('.dxf')) {
        let string = cache.get(id);

        // If the file has been modified, re-parse it
        // Need to check for EOF because this can fire when the file is still being written
        const lastTenChars = code.slice(-10);
        const eof = lastTenChars.lastIndexOf('EOF') !== -1;

        if (eof) {
          const result = await parseDxfFile(code);
          string = `export default ${JSON.stringify(result)}`;
          cache.set(id, string);
        }

        return {
          code: string,
          map: null,
        };
      }
    },
  };
}

const markdownPlugin = md.default({
  mode: [md.Mode.REACT],
});

export default defineConfig({
  base: '/fightstick-enclosure-generator/',
  plugins: [react(), tsconfigPaths(), markdownPlugin, dxfPlugin()],
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [dxfPlugin()],
    },
  },
  worker: {
    plugins: () => [tsconfigPaths()],
  },
});
