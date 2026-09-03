import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    // allow the Arena preview proxy host (any *.e2b.app subdomain)
    allowedHosts: ['.e2b.app'],
  },
  preview: {
    host: true,
    port: 4173,
  },
});
