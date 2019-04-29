import * as actions from './actions'
import { initialState, languages } from './reducer'
import { createStore } from '/store'
const action = {
  type: actions.CHANGE_LANGUAGE,
  payload: {
    language: 'bn'
  }
}
describe('actions', () => {
  describe('changeLanguage', () => {
    it('Changes language and dispatches CHANGE_LANGUAGE action', () => {
      expect(actions.changeLanguage({ language: 'bn' })).toEqual(action)
    })
  })
})
describe('reducer', () => {
  const { store } = createStore()
  it('updates the state with correct language', async () => {
    const expectedState = {
      ...initialState,
      language: 'bn',
      // tslint:disable-next-line no-string-literal
      messages: languages['bn'].messages
    }
    store.dispatch(action)
    expect(store.getState().i18n).toEqual(expectedState)
  })
})
