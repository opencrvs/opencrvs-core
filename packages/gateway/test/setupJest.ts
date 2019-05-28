import { join } from 'path'
import * as fetch from 'jest-fetch-mock'
import { logger } from '../src/logger'

logger.transports['silent'] = true

jest.setMock('node-fetch', { default: fetch })

process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
