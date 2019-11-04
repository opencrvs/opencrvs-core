/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
