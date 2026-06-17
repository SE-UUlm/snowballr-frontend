import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import globals from "globals";
import ts from "typescript-eslint";
import tsdoc from "eslint-plugin-tsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig(
    ...ts.configs.recommended,
    ...svelte.configs["flat/recommended"],
    prettier,
    ...svelte.configs["flat/prettier"],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ["**/*.svelte", "*.svelte"],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: ts.parser,
            },
        },
        plugins: {
            tsdoc,
        },
        rules: {
            "tsdoc/syntax": "warn",
        },
    },
    {
        files: ["**/*.svelte.ts", "*.svelte.ts"],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: ts.parser,
            },
        },
        plugins: {
            tsdoc,
        },
        rules: {
            "tsdoc/syntax": "warn",
        },
    },
    {
        files: ["**/*.ts", "*.ts"],
        languageOptions: {
            parser: ts.parser,
        },
        plugins: {
            tsdoc,
        },
        rules: {
            "tsdoc/syntax": "warn",
        },
    },
    {
        ignores: [
            "build/",
            ".svelte-kit/",
            "dist/",
            "coverage/",
            "e2e-report/",
            "node_modules/",
            "src/lib/model/api/",
        ],
    },
    {
        rules: {
            "svelte/button-has-type": "error",
            "svelte/prefer-const": "error",
            "svelte/html-closing-bracket-new-line": "error",
            "svelte/prefer-class-directive": "warn",
            "svelte/spaced-html-comment": "warn",
            "svelte/prefer-destructured-store-props": "error",
            "svelte/prefer-style-directive": "warn",
            "svelte/shorthand-attribute": "warn",
            "svelte/shorthand-directive": "warn",
            "svelte/html-quotes": "error",
            "svelte/sort-attributes": "error",
            "svelte/no-ignored-unsubscribe": "error",
            "svelte/no-navigation-without-resolve": "off",
        },
    },
);
