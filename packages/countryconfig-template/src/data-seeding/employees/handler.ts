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
import { EMPLOYEES_CSV } from '@countryconfig/constants'
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { basename, join } from 'path'

const EMPLOYEES_SOURCE_DIR = './src/data-seeding/employees/source'

export async function usersHandler(_: Request, h: ResponseToolkit) {
  if (basename(EMPLOYEES_CSV) !== EMPLOYEES_CSV) {
    throw new Error(
      `EMPLOYEES_CSV must be a file name inside ${EMPLOYEES_SOURCE_DIR}, not a path. Received: ${EMPLOYEES_CSV}`
    )
  }

  const users: unknown[] = await readCSVToJSON(
    join(EMPLOYEES_SOURCE_DIR, EMPLOYEES_CSV)
  )
  return h.response(users)
}
