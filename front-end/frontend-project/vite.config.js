import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Cookie', req.headers.cookie || '');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      },
    },
  },
})
