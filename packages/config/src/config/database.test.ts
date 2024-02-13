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
import * as mongoose from 'mongoose'
import { start, stop } from '@config/config/database'
import { logger } from '@config/config/logger'

jest.mock('mongoose', () => ({
  connection: {
    on: jest.fn()
  },
  connect: () => Promise.reject(),
  disconnect: () => {}
}))
const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time))

describe('Database connector', () => {
  it('keeps on retrying a connection on startup', async () => {
    const spy = jest.spyOn(logger, 'error')
    const promise = start()
    await wait(1)
    expect(spy).toHaveBeenCalled()
    jest.spyOn(mongoose, 'connect').mockResolvedValueOnce(mongoose)
    await promise
  })
  it('attaches loggers to database events', async () => {
    const spy = jest.spyOn(logger, 'info')
    const [[, disconnectFn], [, connectedFn]] = (mongoose.connection.on as any)
      .mock.calls
    disconnectFn()
    connectedFn()
    expect(spy).toHaveBeenCalledTimes(2)
  })
  it('calls mongoose disconnect when stop method is called', async () => {
    const spy = jest.spyOn(mongoose, 'disconnect')
    await stop()
    expect(spy).toHaveBeenCalled()
  })
})
