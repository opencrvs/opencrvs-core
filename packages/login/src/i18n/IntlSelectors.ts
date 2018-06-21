import { IntlState } from './IntlReducer'

const getPartialState = (store: any): IntlState => store.i18n

function getKey<T, K extends keyof IntlState>(store: T, key: K) {
  return getPartialState(store)[key]
}

export const getLanguage = (store: any): IntlState['LANGUAGE'] =>
  getKey(store, 'LANGUAGE')

export const getMessages = (store: any): IntlState['messages'] =>
  getKey(store, 'messages')
