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
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          admin: [
            "./src/pages/admin/AdminDashboardPage",
            "./src/pages/admin/AdminLoginPage",
            "./src/pages/admin/AdminServicesPage",
            "./src/pages/admin/AdminTestimonialsPage",
            "./src/pages/admin/AdminPublicationsPage",
            "./src/pages/admin/AdminPublicationEditor",
            "./src/pages/admin/AdminPostsPage",
            "./src/pages/admin/AdminLeadsPage",
            "./src/pages/admin/AdminAnalyticsPage",
            "./src/pages/admin/AdminUsersPage",
            "./src/pages/admin/AdminPagesPage",
            "./src/pages/admin/AdminTeamPage",
            "./src/pages/admin/AdminFaqsPage",
            "./src/pages/admin/AdminMediaPage",
            "./src/pages/admin/AdminSeoPage",
            "./src/pages/admin/AdminLegalCategoriesPage",
            "./src/pages/admin/AdminDocumentPaymentsPage"
          ]
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