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
import { ENVIRONMENT_NAME } from '@countryconfig/constants'
import { readCSVToJSON } from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { existsSync } from 'fs'
import { join } from 'path'

const EMPLOYEES_SOURCE_DIR = './src/data-seeding/employees/source'
const DEFAULT_EMPLOYEES_CSV = 'default-employees.csv'

/**
 * Employees CSV to seed for the given environment: `<environment>-employees.csv`
 * when that file exists in the source directory, otherwise
 * `default-employees.csv`. Add a `production-employees.csv` (etc.) to the source
 * directory to seed a different set of users per environment — no code change
 * needed.
 */
export function employeesCsvForEnvironment(environmentName: string): string {
  const environmentFile = `${environmentName}-employees.csv`
  return existsSync(join(EMPLOYEES_SOURCE_DIR, environmentFile))
    ? environmentFile
    : DEFAULT_EMPLOYEES_CSV
}

export async function usersHandler(_: Request, h: ResponseToolkit) {
  const users: unknown[] = await readCSVToJSON(
    join(EMPLOYEES_SOURCE_DIR, employeesCsvForEnvironment(ENVIRONMENT_NAME))
  )
  return h.response(users)
}
