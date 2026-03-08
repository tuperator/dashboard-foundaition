import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("react-router") ||
            id.includes("@remix-run")
          ) {
            return "vendor-router";
          }

          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }

          if (id.includes("recharts")) {
            return "vendor-charts";
          }

          if (id.includes("axios")) {
            return "vendor-network";
          }

          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform/resolvers") ||
            id.includes("zod")
          ) {
            return "vendor-forms";
          }

          if (id.includes("@hugeicons")) {
            return "vendor-icons";
          }

          if (id.includes("@base-ui") || id.includes("radix-ui")) {
            return "vendor-ui";
          }

          if (
            id.includes("next-themes") ||
            id.includes("sonner") ||
            id.includes("date-fns")
          ) {
            return "vendor-app";
          }

          return "vendor-core";
        },
      },
    },
  },
});
