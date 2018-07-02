jest.mock('mongoose', () => ({
  connection: {
    // tslint:disable-next-line no-empty
    on: () => {}
  },
  connect: () => Promise.reject()
}))

import * as mongoose from 'mongoose'
import { start } from './database'
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
})
