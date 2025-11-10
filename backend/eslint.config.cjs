const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  {
    files: ["frontend/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-irregular-whitespace": "error",
    },
  },
  {
    files: ["backend/**/*.{js,mjs,cjs}", "server.js"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-irregular-whitespace": "error",
    },
  },
  {
    files: ["**/tests/**/*.js"],
    languageOptions: { globals: { ...globals.jest } },
  },
  {
    ignores: ["node_modules/", "dist/", "coverage/", "**/*.min.js"],
  },
]);