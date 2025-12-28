import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@remotion/bundler', '@remotion/renderer', '@remotion/cli']
  },
  resolve: {
    alias: {
      // 防止 Node.js 模块在浏览器中加载
      'ws': 'ws/browser.js',
      'bufferutil': false,
      'utf-8-validate': false,
    }
  },
  build: {
    rollupOptions: {
      external: [
        '@remotion/bundler',
        '@remotion/renderer',
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'buffer'
      ]
    }
  }
})
