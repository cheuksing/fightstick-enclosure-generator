import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
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

        if (!string) {
          // If the file has been modified, re-parse it
          // Need to check for EOF because this can fire when the file is still being written
          const lastTenChars = code.slice(-10);
          const eof = lastTenChars.lastIndexOf('EOF') !== -1;
          console.log('eof', eof);

          if (eof) {
            const result = await parseDxfFile(code);
            string = JSON.stringify(result);
            cache.set(id, string);
          }
        }

        return `export default ${string};`;
      }
    },
    handleHotUpdate({file, server}) {
      if (file.endsWith('.dxf')) {
        cache.delete(file);
        const module = server.moduleGraph.getModuleById(file);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
      }
    },
  };
}

const markdownPlugin = md.default({
  mode: [md.Mode.REACT],
});

export default defineConfig({
  base: '/fightstick-enclosure-generator/',
  plugins: [tsconfigPaths(), markdownPlugin, dxfPlugin()],
  build: {
    sourcemap: true,
  },
  worker: {
    plugins: () => [tsconfigPaths()],
  },
});
