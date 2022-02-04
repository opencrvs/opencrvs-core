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
import { createStore, IStoreState, AppStore } from '@client/store'
import {
  createTestComponent,
  mockApplicationData,
  createRouterProps,
  createTestApp
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { Event, ReviewSection } from '@client/forms'
import {
  IApplication,
  storeApplication,
  modifyApplication,
  createReviewApplication,
  SUBMISSION_STATUS
} from '@client/applications'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { Store } from 'redux'
import { History } from 'history'

let wrapper: ReactWrapper<{}, {}>
let store: Store
let history: History

const application: IApplication = createReviewApplication(
  '72c18939-70c1-40b4-9b80-b162c4871160',
  mockApplicationData,
  Event.BIRTH,
  SUBMISSION_STATUS.REGISTERED
)

application.data.mother = {
  ...application.data.mother,
  iD: '123456789'
}

application.data.registration = {
  ...application.data.registration,
  presentAtBirthRegistration: 'MOTHER',
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01557394986' }
  }
}

describe('Review form for an application', () => {
  beforeEach(async () => {
    const appBundle = await createTestApp()

    wrapper = appBundle.app
    store = appBundle.store
    history = appBundle.history

    store.dispatch(storeApplication(application))

    history.replace(
      formatUrl(CERTIFICATE_CORRECTION_REVIEW, {
        applicationId: application.id,
        pageId: ReviewSection.Review,
        groupId: 'review-view-group'
      })
    )
    wrapper.update()
  })

  it('should disable the continue button if there is an error', () => {
    store.dispatch(
      modifyApplication({
        ...application,
        data: {
          ...application.data,
          child: {}
        }
      })
    )
    wrapper.update()
    expect(
      wrapper.find('#continue_button').hostNodes().props().disabled
    ).toBeTruthy()
  })

  it('should cancel the correction when the cross button is pressed', () => {
    wrapper.find('#crcl-btn').hostNodes().simulate('click')
    wrapper.update()

    expect(history.location.pathname).toContain('/review')
  })

  it('should go to supporting documents form when continue is pressed', () => {
    wrapper.update()
    wrapper.find('#continue_button').hostNodes().simulate('click')
    wrapper.update()

    expect(history.location.pathname).toContain('/supportingDocuments')
  })
})
