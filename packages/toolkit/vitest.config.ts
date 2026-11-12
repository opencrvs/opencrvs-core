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

import { createRequire } from 'node:module'
import { defineConfig } from 'vitest/config'
import { yamlForms } from './src/configurator/yamlForms'

const require = createRequire(import.meta.url)

export default defineConfig({
  // The configurator's tests import its wizard.yml, see yamlForms.ts
  plugins: [yamlForms()],
  resolve: {
    alias: {
      // The ESM entry of libsodium-wrappers 0.7.16 imports a file the package does not ship.
      // The CLI is bundled as CommonJS, which uses the CommonJS build: tests do the same.
      'libsodium-wrappers': require.resolve('libsodium-wrappers')
    }
  }
})
