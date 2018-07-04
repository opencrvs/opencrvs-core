const fetch = require('jest-fetch-mock')
jest.setMock('node-fetch', { default: fetch })
