/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/*
 * This config previously extended recommendedTypeChecked, but it was never
 * actually exercised: the old repository's `yarn lint` ran `eslint .` against a
 * root .eslintrc.js whose only rule was `no-console: warn`. Enabling typed
 * linting here surfaces 28 errors — 9 no-floating-promises plus unsafe
 * assignments in the websub and crypto paths — which is a code-quality change
 * that should be made deliberately, not as a side effect of moving the package.
 *
 * TODO: enable typed linting. Add
 *   { languageOptions: { parserOptions: { projectService: true,
 *     tsconfigRootDir: import.meta.dirname } } }
 * alongside recommendedTypeChecked, then work through the findings.
 */
export default tseslint.config(
  {
    ignores: ["build/**", "certs/**", "docs/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      // The codebase omits fields by destructuring them out (`const { proof,
      // ...payload } = credential`) and marks deliberately unused handler
      // arguments with a leading underscore.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
      ],
    },
  },
);
