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
import { parse } from 'yaml'
import type { Plugin } from 'vite'

// Compiles `import form from './x.yml'` into plain JSON at build time, so the
// form definition stays hand-authored YAML and the bundle only holds JSON.
// Used by the page's Vite build and by Vitest, which imports the same files.
export function yamlForms(): Plugin {
  return {
    name: 'yaml-forms',
    transform(code, id) {
      if (!id.endsWith('.yml')) return null
      return { code: `export default ${JSON.stringify(parse(code))}`, map: null }
    }
  }
}
