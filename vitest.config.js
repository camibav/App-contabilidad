import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.js"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/domain/**/*.js", "src/app/**/*.js", "src/utils/**/*.js"],
      exclude: ["src/**/__tests__/**"]
    }
  }
});
