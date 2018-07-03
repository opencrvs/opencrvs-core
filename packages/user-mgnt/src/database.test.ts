jest.mock('mongoose', () => ({
  connection: {
    // tslint:disable-next-line no-empty
    on: jest.fn()
  },
  connect: () => Promise.reject(),
  // tslint:disable-next-line no-empty
  disconnect: () => {}
}))

import * as mongoose from 'mongoose'
import { start, stop } from './database'
import { logger } from 'src/logger'

const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

describe('Database connector', () => {
  it('keeps on retrying a connection on startup', async () => {
    const spy = jest.spyOn(logger, 'error')
    const promise = start()
    await wait(1)
    expect(spy).toHaveBeenCalled()
    jest.spyOn(mongoose, 'connect').mockResolvedValueOnce('hello!')
    await promise
  })
  it('attaches loggers to database events', async () => {
    const spy = jest.spyOn(logger, 'info')
    const [[, disconnectFn], [, connectedFn]] = (mongoose.connection
      .on as any).mock.calls
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
