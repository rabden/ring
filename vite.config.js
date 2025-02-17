import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: 'localhost', // Change from true to 'localhost'
    port: 8080,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      clientPort: 8080,
      timeout: 10000, // Increased timeout
      overlay: true,
      path: 'hmr-ws'  // Add explicit websocket path
    },
    watch: {
      usePolling: false  // Changed to false for better performance
    },
    middlewareMode: false
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "lib"),
      },
      {
        find: "react",
        replacement: resolve(__dirname, "node_modules/react")
      },
      {
        find: "react-dom",
        replacement: resolve(__dirname, "node_modules/react-dom")
      },
    ],
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
}));
