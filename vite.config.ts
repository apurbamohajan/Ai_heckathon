import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PROXY = {
  '/ollama': {
    target: 'http://localhost:11434',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/ollama/, ''),
  },

  '^/agent/': {
    target: 'https://ravishing-amazement-production-605e.up.railway.app',
    changeOrigin: true,
  },
  // Real-time voice — backend mints LiveKit tokens.
  '^/voice/': {
    target: 'https://ravishing-amazement-production-605e.up.railway.app',
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
