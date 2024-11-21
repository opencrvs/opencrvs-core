/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  createTestComponent,
  createTestStore,
  setScopes
} from '@client/tests/util'
import { DownloadButton } from './DownloadButton'
import { AppStore } from '@client/store'
import { History } from 'history'
import * as React from 'react'
import { DownloadAction } from '@client/forms'
import * as declarationReducer from '@client/declarations'
import { ApolloClient } from '@apollo/client'
import { createClient } from '@client/utils/apolloClient'
import { SCOPES } from '@client/utils/gateway'

const { DOWNLOAD_STATUS } = declarationReducer

describe('download button', () => {
  let store: AppStore
  let history: History<unknown>
  let client: ApolloClient<{}>

  describe('when there is no assignment', () => {
    beforeEach(async () => {
      const testStore = await createTestStore()
      store = testStore.store
      history = testStore.history
      client = createClient(store)
    })

    it('if the record is actionable, download button should not be disabled', async () => {
      setScopes([SCOPES.RECORD_REGISTER], store)
      const testComponent = await createTestComponent(
        <DownloadButton
          id="download"
          downloadConfigs={{
            event: 'birth',
            compositionId: '123',
            action: DownloadAction.LOAD_REVIEW_DECLARATION,
            assignment: undefined
          }}
          status={DOWNLOAD_STATUS.DOWNLOADED}
          declarationStatus={declarationReducer.SUBMISSION_STATUS.DECLARED}
        />,
        { store, history, apolloClient: client }
      )
      expect(
        testComponent.find('#download-icon').hostNodes().prop('disabled')
      ).toBeFalsy()
    })

    it('if the record is not actionable, download button should be disabled', async () => {
      setScopes([SCOPES.RECORD_SUBMIT_FOR_REVIEW], store)
      const testComponent = await createTestComponent(
        <DownloadButton
          id="download"
          downloadConfigs={{
            event: 'birth',
            compositionId: '123',
            action: DownloadAction.LOAD_REVIEW_DECLARATION,
            assignment: undefined
          }}
          status={DOWNLOAD_STATUS.DOWNLOADED}
          declarationStatus={declarationReducer.SUBMISSION_STATUS.DECLARED}
        />,
        { store, history, apolloClient: client }
      )
      expect(
        testComponent.find('#download-icon').hostNodes().prop('disabled')
      ).toBeTruthy()
    })
  })

  describe('when there is assignment', () => {
    beforeEach(async () => {
      const testStore = await createTestStore()
      store = testStore.store
      history = testStore.history
      client = createClient(store)
    })

    it.only('if assigned to current user & not downloaded then should not show avatar', async () => {
      setScopes([SCOPES.RECORD_REGISTER], store)
      const testComponent = await createTestComponent(
        <DownloadButton
          id="download"
          downloadConfigs={{
            event: 'birth',
            compositionId: '123',
            action: DownloadAction.LOAD_REVIEW_DECLARATION,
            assignment: {
              firstName: 'Kennedy',
              lastName: 'Mweene',
              officeName: 'Ibombo District Office',
              practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534',
              avatarURL: '/ocrvs/4c3645fc-f3f9-4c89-b109-05daa8f49b3b.jpg'
            }
          }}
          declarationStatus={declarationReducer.SUBMISSION_STATUS.DECLARED}
        />,
        { store, history, apolloClient: client }
      )
      expect(testComponent.find('img').length).toBe(0)
    })
  })
})
