
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      timeout: 30000
    }
  },
  plugins: [
    react({
      jsxRuntime: 'classic',
      jsxImportSource: 'react',
      include: "**/*.{jsx,tsx}",
      exclude: /node_modules/,
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ],
        babelrc: false,
        configFile: false
      },
      refresh: true
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    force: true,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));
