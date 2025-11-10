// eslint.config.mjs

import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
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
    ignores: ["node_modules/", "dist/", "coverage/", "**/*.min.js"],
  },
]);