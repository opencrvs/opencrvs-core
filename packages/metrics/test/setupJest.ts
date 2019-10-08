import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { default: fetch })
jest.mock('../src/influxdb/client', () => ({
  __esModule: true,
  writePoints: jest.fn().mockReturnValue(Promise.resolve()),
  readPoints: jest.fn()
}))
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
process.env.NODE_ENV = 'DEVELOPMENT'
