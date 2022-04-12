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
import * as actions from '@client/forms/configuration/actions'
import { initialState } from '@client/forms/configuration/reducer'
import { createStore, AppStore } from '@client/store'
import { flushPromises } from '@client/tests/util'
import { formDraftQueries } from '@client/forms/configuration/queries'

describe('Form draft reducer tests', () => {
  let store: AppStore
  beforeEach(() => {
    store = createStore().store
    jest.spyOn(formDraftQueries, 'fetchFormDraft').mockImplementation(
      () =>
        new Promise((resolve) =>
          resolve({
            data: {
              getFormDraft: [
                {
                  event: 'birth',
                  status: 'DRAFT',
                  comment: 'Modified birth draft',
                  version: 2,
                  createdAt: 1648308385612,
                  updatedAt: 1648308385612,
                  history: [
                    {
                      status: 'DRAFT',
                      version: 1,
                      comment: 'First Draft',
                      lastUpdateAt: 1648308385612
                    }
                  ]
                },
                {
                  event: 'death',
                  status: 'DRAFT',
                  comment: 'Modified death draft',
                  version: 2,
                  createdAt: 1648308385612,
                  updatedAt: 1648308385612,
                  history: [
                    {
                      status: 'DRAFT',
                      version: 1,
                      comment: 'First Draft',
                      lastUpdateAt: 1648308385612
                    }
                  ]
                }
              ]
            }
          })
        )
    )
  })

  it('fetch and store form draft', async () => {
    const expectedState = {
      ...initialState,
      formDraftDataLoaded: true,
      loadingError: false,
      formDraftData: {
        birth: {
          event: 'birth',
          status: 'DRAFT',
          comment: 'Modified birth draft',
          version: 2,
          createdAt: 1648308385612,
          updatedAt: 1648308385612,
          history: [
            {
              status: 'DRAFT',
              version: 1,
              comment: 'First Draft',
              lastUpdateAt: 1648308385612
            }
          ]
        },
        death: {
          event: 'death',
          status: 'DRAFT',
          comment: 'Modified death draft',
          version: 2,
          createdAt: 1648308385612,
          updatedAt: 1648308385612,
          history: [
            {
              status: 'DRAFT',
              version: 1,
              comment: 'First Draft',
              lastUpdateAt: 1648308385612
            }
          ]
        }
      }
    }

    const action = {
      type: actions.LOAD_FORM_DRAFT
    }
    store.dispatch(action)
    await flushPromises()
    expect(store.getState().formDraft).toEqual(expectedState)
  })

  it('return loadingError true if any rejected by graphql', async () => {
    jest.spyOn(formDraftQueries, 'fetchFormDraft').mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          reject('Error occured while query')
        })
    )
    const expectedState = {
      ...initialState,
      loadingError: true
    }

    const action = {
      type: actions.LOAD_FORM_DRAFT
    }
    store.dispatch(action)
    await flushPromises()
    expect(store.getState().formDraft).toEqual(expectedState)
  })
})
