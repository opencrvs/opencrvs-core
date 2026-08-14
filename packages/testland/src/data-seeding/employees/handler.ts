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
import { join } from 'path'

const EMPLOYEES_SOURCE_DIR = './src/data-seeding/employees/source'
const DEFAULT_EMPLOYEES_CSV = 'default-employees.csv'

/**
 * Which employees CSV in `src/data-seeding/employees/source/` to seed for a
 * given environment. Any environment not listed here uses
 * `default-employees.csv`.
 */
const EMPLOYEES_CSV_BY_ENVIRONMENT: Record<string, string> = {
  production: 'production-employees.csv'
}

export function employeesCsvForEnvironment(environmentName: string): string {
  return EMPLOYEES_CSV_BY_ENVIRONMENT[environmentName] ?? DEFAULT_EMPLOYEES_CSV
}

export async function usersHandler(_: Request, h: ResponseToolkit) {
  const users: unknown[] = await readCSVToJSON(
    join(EMPLOYEES_SOURCE_DIR, employeesCsvForEnvironment(ENVIRONMENT_NAME))
  )
  return h.response(users)
}
