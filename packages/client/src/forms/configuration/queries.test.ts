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
import { formDraftQueries } from '@client/forms/configuration/queries'
import { createStore } from '@client/store'
import { createClient } from '@client/utils/apolloClient'

describe('When calling mutateApplicationConfig', () => {
  const { store } = createStore()
  const client = createClient(store)

  beforeEach(() => {
    const mock = jest.fn()
    mock.mockResolvedValueOnce({
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
    client.query = mock
  })
  it('Should return the birth and death form draft', async () => {
    const queryData = await formDraftQueries.fetchFormDraft()
    if (queryData && queryData.data) {
      expect(queryData.data.getFormDraft.length).toBe(2)
    } else {
      throw new Error('Failed')
    }
  })
})
