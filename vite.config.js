
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    hmr: {
      overlay: true
    },
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Include React imports automatically
      include: "**/*.{jsx,tsx}",
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "lib": resolve(__dirname, "lib"),
      // Ensure React is properly resolved
      "react": resolve(__dirname, "node_modules/react"),
      "react-dom": resolve(__dirname, "node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
}));
