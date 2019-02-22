import * as fetch from 'jest-fetch-mock'
jest.setMock('node-fetch', { default: fetch })
