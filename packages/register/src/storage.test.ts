import * as localForage from 'localforage'

jest.genMockFromModule('localforage')

import { storage } from './storage'

describe('storage tests', () => {
  beforeAll(() => {
    storage.configStorage('OpenCRVS_TEST')
  })
  describe('configure', () => {
    it('local forage should be configured', async () => {
      localForage.ready().then(ready => {
        expect(ready).toEqual(true)
      })
    })
  })
})
