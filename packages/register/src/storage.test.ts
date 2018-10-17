import * as localForage from 'localforage'
import { storage } from './storage'

describe('storage tests', () => {
  beforeAll(() => {
    storage.configStorage('OpenCRVS_TEST')
  })
  describe('configure', () => {
    it('local forage should be configured', async () => {
      expect(localForage.config).toBeCalled()
    })
    it('local forage should be configured with passed db name', async () => {
      const [params] = (localForage.config as jest.Mock).mock.calls[
        (localForage.config as jest.Mock).mock.calls.length - 1
      ]
      expect(params.name).toEqual('OpenCRVS_TEST')
    })
  })
  describe('set item', () => {
    storage.setItem('test', 'testItem')
    it('set item by key', async () => {
      const [key, value] = (localForage.setItem as jest.Mock).mock.calls[
        (localForage.setItem as jest.Mock).mock.calls.length - 1
      ]
      expect(key).toEqual('test')
      expect(value).toEqual('testItem')
    })
  })
  describe('get item', () => {
    storage.getItem('test')
    it('get item by key', async () => {
      const [key] = (localForage.getItem as jest.Mock).mock.calls[
        (localForage.getItem as jest.Mock).mock.calls.length - 1
      ]
      expect(key).toEqual('test')
    })
  })
})
