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
import { Request, ResponseToolkit } from '@hapi/hapi'
import { afterEach, describe, expect, test, vi } from 'vitest'

const request = {} as Request
const responseToolkit = {
  response: (payload: unknown) => payload
} as unknown as ResponseToolkit

async function seedEmployeesFrom(fileName: string) {
  vi.stubEnv('EMPLOYEES_CSV', fileName)
  vi.resetModules()
  const { usersHandler } = await import('./handler')
  return usersHandler(request, responseToolkit)
}

describe('employees seeding handler', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('reads the employees file named by EMPLOYEES_CSV', async () => {
    const users = (await seedEmployeesFrom('default-employees.csv')) as Record<
      string,
      unknown
    >[]

    expect(users.length).toBeGreaterThan(0)
    expect(users[0]).toHaveProperty('username')
  })

  test('rejects a value that is a path instead of a file name', async () => {
    await expect(
      seedEmployeesFrom('../../../../package.json')
    ).rejects.toThrowError(/must be a file name/)
  })

  test('fails when the named file does not exist', async () => {
    await expect(seedEmployeesFrom('does-not-exist.csv')).rejects.toThrowError()
  })
})
