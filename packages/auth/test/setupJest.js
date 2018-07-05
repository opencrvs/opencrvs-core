const { join } = require('path')
const fetch = require('jest-fetch-mock')
const redis = require('redis-mock')

jest.setMock('node-fetch', { default: fetch })

const database = {}
jest.setMock('src/database', {
  set: (key, value) => {
    database[key] = value
  },
  get: key => database[key],
  del: key => {},
  start: () => {},
  stop: () => {}
})

process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, './cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
