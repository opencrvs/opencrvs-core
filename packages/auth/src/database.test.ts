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

const mockCreateClient = jest.fn()

jest.mock('redis', () => ({ createClient: mockCreateClient }))

/**
 * `test/setupJest.ts` installs an in-memory stand-in for this module, so the
 * real implementation has to be pulled in explicitly. A fresh copy is loaded
 * per case so the envalid environment re-reads `REDIS_DB`.
 */
async function connectWithEnv(redisDb?: string) {
  jest.resetModules()
  mockCreateClient.mockReset()
  mockCreateClient.mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined)
  })

  const previous = process.env.REDIS_DB
  if (redisDb === undefined) {
    delete process.env.REDIS_DB
  } else {
    process.env.REDIS_DB = redisDb
  }

  try {
    const { start } = jest.requireActual(
      './database'
    ) as typeof import('./database')
    await start()
  } finally {
    if (previous === undefined) {
      delete process.env.REDIS_DB
    } else {
      process.env.REDIS_DB = previous
    }
  }

  return mockCreateClient.mock.calls[0][0]
}

describe('auth redis client', () => {
  it('selects logical DB 0 when REDIS_DB is unset', async () => {
    const options = await connectWithEnv(undefined)
    expect(options).toMatchObject({ database: 0 })
  })

  it('selects the logical DB named by REDIS_DB', async () => {
    const options = await connectWithEnv('4')
    expect(options).toMatchObject({ database: 4 })
  })
})
