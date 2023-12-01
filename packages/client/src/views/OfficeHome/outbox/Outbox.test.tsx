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
  createDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { AppStore } from '@client/store'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import {
  createTestComponent,
  createTestStore,
  mockDeclarationData
} from '@client/tests/util'
import { Event } from '@client/utils/gateway'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { Outbox } from './Outbox'

function storeOutboxDeclaration(
  store: AppStore,
  submissionStatus: SUBMISSION_STATUS
) {
  const declaration = createDeclaration(Event.Birth, mockDeclarationData)
  declaration.submissionStatus = submissionStatus
  store.dispatch(storeDeclaration(declaration))
}
describe('outbox component tests', () => {
  let testComponent: ReactWrapper<
    any,
    Readonly<{}>,
    React.Component<{}, {}, any>
  >
  let store: AppStore
  let history
  beforeAll(async () => {
    const testStore = await createTestStore()
    store = testStore.store
    history = testStore.history
    testComponent = await createTestComponent(<Outbox />, { store, history })
  })

  describe('when there is no data', () => {
    it('render fallback text', () => {
      expect(testComponent.find('#no-record').hostNodes().text()).toContain(
        'No records require processing'
      )
    })
  })

  describe('when there declarations with different submission statuses', () => {
    const outboxSubmissionStatuses = [
      ...ALLOWED_STATUS_FOR_RETRY,
      ...INPROGRESS_STATUS
    ]
    beforeAll(() => {
      outboxSubmissionStatuses.forEach((status) =>
        storeOutboxDeclaration(store, status)
      )
      testComponent.update()
    })
    it('renders all declarations', () => {
      expect(
        testComponent
          .find(`#row_${outboxSubmissionStatuses.length - 1}`)
          .hostNodes()
      ).toHaveLength(1)
    })
  })
})
