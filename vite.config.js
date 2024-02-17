import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import md from 'vite-plugin-markdown';

const markdownPlugin = md.default({
  mode: [md.Mode.REACT],
});

export default defineConfig({
  base: '/fightstick-enclosure-generator/',
  plugins: [tsconfigPaths(), markdownPlugin],
});
