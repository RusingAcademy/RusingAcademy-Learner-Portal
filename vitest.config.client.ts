import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  plugins: [react()],
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    // Client tests use jsdom environment
    include: ["client/**/*.test.tsx", "client/**/*.spec.tsx"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/test-setup.ts"],
  },
});
