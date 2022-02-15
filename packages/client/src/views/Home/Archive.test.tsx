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
import * as React from 'react'
import {
  createTestComponent,
  mockApplicationData,
  createRouterProps,
  getItem,
  mockRegistrarUserResponse,
  registerScopeToken
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createApplication,
  storeApplication,
  IApplication,
  SUBMISSION_STATUS
} from '@client/applications'
import { Event } from '@client/forms'
import { formatUrl } from '@client/navigation'
import { APPLICATION_RECORD_AUDIT } from '@client/navigation/routes'
import { queries } from '@client/profile/queries'
import { checkAuth } from '@client/profile/profileActions'

const application: IApplication = createApplication(
  Event.BIRTH,
  mockApplicationData
)
application.data.registration = {
  ...application.data.registration,
  presentAtBirthRegistration: 'MOTHER',
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01557394986' }
  }
}

describe('Record audit', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    const mockFetchUserDetails = jest.fn()
    mockFetchUserDetails.mockReturnValue(mockRegistrarUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails

    getItem.mockReturnValue(registerScopeToken)

    store.dispatch(checkAuth({ '?token': registerScopeToken }))

    application.submissionStatus = SUBMISSION_STATUS.DECLARED
    store.dispatch(storeApplication(application))

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            applicationId: application.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: application.id
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('should show the archive button', async () => {
    expect(component.exists('#archive_button')).toBeTruthy()
  })
})
