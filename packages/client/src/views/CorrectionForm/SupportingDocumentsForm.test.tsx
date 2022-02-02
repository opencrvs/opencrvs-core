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
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockApplicationData,
  mockDeathApplicationData
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { waitForElement } from '@client/tests/wait-for-element'
import { Event } from '@client/forms'
import { IApplication } from '@client/applications'
import { SupportingDocumentsForm } from './SupportingDocumentsForm'

let wrapper: ReactWrapper<{}, {}>

const birthApplication: IApplication = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: mockApplicationData,
  event: Event.BIRTH
}

const deathApplication: IApplication = {
  id: '72c18939-70c1-40b4-9b80-b162c4871161',
  data: mockDeathApplicationData,
  event: Event.DEATH
}

const { store, history } = createStore()

describe('First time on corrector supporting document', () => {
  beforeEach(async () => {
    wrapper = await createTestComponent(
      <SupportingDocumentsForm application={birthApplication} />,
      {
        store,
        history
      }
    )
    await waitForElement(wrapper, '#corrector_form')
  })
  it('should disable the continue button', () => {
    expect(
      wrapper.find('#confirm_form').hostNodes().props().disabled
    ).toBeTruthy()
  })
})
describe('When select any radio option', () => {
  beforeEach(async () => {
    const application: IApplication = {
      ...birthApplication,
      data: {
        ...birthApplication.data,
        supportingDocuments: {
          supportDocumentRequiredForCorrection: true
        }
      }
    }
    wrapper = await createTestComponent(
      <SupportingDocumentsForm application={application} />,
      {
        store,
        history
      }
    )
    await waitForElement(wrapper, '#corrector_form')
  })
  it('should not disable the continue button', () => {
    expect(
      wrapper.find('#confirm_form').hostNodes().props().disabled
    ).toBeFalsy()
  })
})
