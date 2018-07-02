import { createServer } from './index'
import * as database from './database'

// tslint:disable-next-line no-empty
const noop = () => {}

const { start, stop } = database

beforeEach(() => {
  // @ts-ignore
  database.start = noop
  // @ts-ignore
  database.stop = noop
})

afterEach(() => {
  // @ts-ignore
  database.start = start
  // @ts-ignore
  database.stop = stop
})

test('should start and stop server without error', async () => {
  const server = await createServer()

  // @ts-ignore
  server.server.start = noop
  // @ts-ignore
  server.server.stop = noop

  await server.start()
  await server.stop()
})
