import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PROXY = {
  '/ollama': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/ollama/, ''),
  },

  '^/agent/': {
    target: 'http://127.0.0.1:8787',
    changeOrigin: true,
  },
  // Real-time voice — backend mints LiveKit tokens.
  '^/voice/': {
    target: 'http://127.0.0.1:8787',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: PROXY,
  },
  preview: {
    port: 5173,
    proxy: PROXY,
  },
});
