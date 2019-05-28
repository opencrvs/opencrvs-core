import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

import { IDatabaseConnector } from '../src/database'

jest.setMock('node-fetch', { default: fetch })

const database: { [key: string]: string } = {}

const mock: IDatabaseConnector = {
  set: async (key, value) => {
    database[key] = value
  },
  get: async key => database[key] || null,
  del: async key => {
    const keyExists = !!database[key]
    delete database[key]
    return keyExists ? 1 : 0
  },
  // tslint:disable-next-line no-empty
  start: () => {},
  // tslint:disable-next-line no-empty
  stop: () => {}
}

jest.setMock('src/database', mock)

process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, './cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
