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

import * as fs from 'fs'
import path from 'path'
import { getCwd } from '.'

const PATHS_TO_REMOVE = [
  {
    relativePath: 'src/migrations/hearth',
    label: 'Hearth migrations directory'
  },
  {
    relativePath: 'src/migrations/user-mgnt',
    label: 'user-mgnt migrations directory'
  },
  { relativePath: 'src/utils/hearth-helpers.ts', label: 'Hearth helpers file' }
]

async function main() {
  for (const { relativePath, label } of PATHS_TO_REMOVE) {
    const absolutePath = path.join(getCwd(), relativePath)

    if (fs.existsSync(absolutePath)) {
      fs.rmSync(absolutePath, { recursive: true, force: true })
      // eslint-disable-next-line no-console
      console.log(`Removed ${label} '${relativePath}'.`)
    } else {
      // eslint-disable-next-line no-console
      console.log(`No ${label} found at '${relativePath}'.`)
    }
  }
}

export { main }
