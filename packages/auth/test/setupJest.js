const { join } = require('path')
const fetch = require('jest-fetch-mock')
const redis = require('redis-mock')

jest.setMock('node-fetch', { default: fetch })
jest.setMock('redis', redis)

process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, './cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
