import * as localForage from 'localforage'

function configStorage(dbName: string) {
  localForage.config({
    driver: localForage.INDEXEDDB,
    name: dbName
  })
}

async function getItem(key: string): Promise<string> {
  return await localForage.getItem<string>(key)
}

async function setItem(key: string, value: string) {
  return await localForage.setItem(key, value)
}

async function removeItem(key: string) {
  return await localForage.removeItem(key)
}

export const storage = {
  configStorage,
  getItem,
  setItem,
  removeItem
}
