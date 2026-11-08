import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: { entry: { index: 'src/index.ts', presenter: 'src/presenter.ts', pair: 'src/pair.ts', 'cloudflare/relay': 'src/cloudflare/relay.ts' }, formats: ['es'], fileName: (_format, entryName) => `${entryName}.js`, cssFileName: 'styles' },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime', 'motion/react', 'cloudflare:workers'] },
    cssCodeSplit: false,
  },
});
