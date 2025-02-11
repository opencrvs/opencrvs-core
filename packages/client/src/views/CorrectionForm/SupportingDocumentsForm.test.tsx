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
import { createStore } from '@client/store'
import {
  createTestComponent,
  mockDeclarationData,
  TestComponentWithRouteMock
} from '@client/tests/util'

import * as React from 'react'
import { CorrectionSection } from '@client/forms'
import { EventType } from '@client/utils/gateway'
import { IDeclaration, storeDeclaration } from '@client/declarations'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { CorrectionForm } from './CorrectionForm'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'

let wrapper: TestComponentWithRouteMock

const birthDeclaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: mockDeclarationData,
  event: EventType.Birth
}

const { store } = createStore()

describe('for an declaration', () => {
  beforeEach(async () => {
    store.dispatch(storeDeclaration(birthDeclaration))
    wrapper = await createTestComponent(<CorrectionForm />, {
      store,
      path: CERTIFICATE_CORRECTION,
      initialEntries: [
        formatUrl(CERTIFICATE_CORRECTION, {
          declarationId: birthDeclaration.id,
          pageId: CorrectionSection.SupportingDocuments
        })
      ]
    })
  })

  it('should disable the continue button', () => {
    expect(
      wrapper.component.find('#confirm_form').hostNodes().props().disabled
    ).toBeTruthy()
  })

  it('should enable the continue button if any radio button is selected', () => {
    wrapper.component
      .find('#supportDocumentRequiredForCorrection_true')
      .hostNodes()
      .simulate('change', { target: { checked: true } })
    wrapper.component.update()
    expect(
      wrapper.component.find('#confirm_form').hostNodes().props().disabled
    ).toBeFalsy()
  })
  it('should goto home if cross button is pressed', () => {
    wrapper.component.find('#crcl-btn').hostNodes().simulate('click')
    wrapper.component.update()
    expect(wrapper.router.state.location.pathname).toContain(
      WORKQUEUE_TABS.readyForReview
    )
  })
})
