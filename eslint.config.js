// @ts-check
import eslint from "@eslint/js";
import gitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  gitignore(),
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts,astro}"],
    rules: {
      "no-undef": "off"
    }
  },
  ...eslintPluginAstro.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    ignores: [
      "src/content/blog/*.md",
      "tailwind.config.cjs",
      "src/components/GoogleTagManager.astro"
    ]
  }
);
