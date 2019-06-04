import { IntlState } from '@performance/i18n/reducer'
import { IStoreState } from '@performance/store'

const getPartialState = (store: IStoreState): IntlState => store.i18n

function getKey<K extends keyof IntlState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getLanguage = (store: IStoreState): IntlState['language'] =>
  getKey(store, 'language')

export const getLanguages = (store: IStoreState): IntlState['languages'] =>
  getKey(store, 'languages')

export const getMessages = (store: IStoreState): IntlState['messages'] =>
  getKey(store, 'messages')
