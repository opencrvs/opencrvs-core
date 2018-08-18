import { I18nState } from './i18nReducer'
import { IStoreState } from '../store'

const getPartialState = (store: IStoreState): I18nState => store.i18n

function getKey<K extends keyof I18nState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

export const getLanguage = (store: IStoreState): I18nState['LANGUAGE'] =>
  getKey(store, 'LANGUAGE')

export const getMessages = (store: IStoreState): I18nState['messages'] =>
  getKey(store, 'messages')
