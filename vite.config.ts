import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) return "react";
            if (id.includes("react-router-dom")) return "router";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("recharts")) return "charts";
            if (id.includes("lucide-react")) return "icons";

            return "vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
  }
} as any);