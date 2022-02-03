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
  createRouterProps,
  createTestComponent,
  flushPromises,
  mockApplicationData,
  mockDeathApplicationData
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { waitForElement } from '@client/tests/wait-for-element'
import { CorrectionSection, Event } from '@client/forms'
import { IApplication, storeApplication } from '@client/applications'
import { SupportingDocumentsForm } from './SupportingDocumentsForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { CorrectionForm } from './CorrectionForm'

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

describe('for an application', () => {
  beforeEach(async () => {
    store.dispatch(storeApplication(birthApplication))
    wrapper = await createTestComponent(
      <CorrectionForm
        {...createRouterProps(
          formatUrl(CERTIFICATE_CORRECTION, {
            applicationId: birthApplication.id,
            pageId: CorrectionSection.SupportingDocuments
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: birthApplication.id,
              pageId: CorrectionSection.SupportingDocuments
            }
          }
        )}
      />,
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

  it('should enable the continue button if any radio button is selected', () => {
    wrapper
      .find('#supportDocumentRequiredForCorrection_true')
      .hostNodes()
      .simulate('change', { target: { checked: true } })
    wrapper.update()
    expect(
      wrapper.find('#confirm_form').hostNodes().props().disabled
    ).toBeFalsy()
  })
  it('should goto home if cross button is pressed', () => {
    wrapper.find('#crcl-btn').hostNodes().simulate('click')
    wrapper.update()
    expect(history.location.pathname).toContain('/review')
  })
})
