import * as actions from '@performance/i18n/actions'
import { initialState, languages } from '@performance/i18n/reducer'
import { createStore } from '@opencrvs/performance/src/store'
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
      // @ts-ignore
      messages: languages['bn'].messages
    }
    store.dispatch(action)
    expect(store.getState().i18n).toEqual(expectedState)
  })
})
