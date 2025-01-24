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
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'

let wrapper: TestComponentWithRouteMock

const birthDeclaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: mockDeclarationData,
  event: EventType.Birth
}

const { store } = createStore()

describe('Correction reason form', () => {
  describe('for an declaration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      wrapper = await createTestComponent(<CorrectionForm />, {
        store,
        path: CERTIFICATE_CORRECTION,
        initialEntries: [
          formatUrl(CERTIFICATE_CORRECTION, {
            declarationId: birthDeclaration.id,
            pageId: CorrectionSection.Reason
          })
        ]
      })
    })
    it('should disable the continue button if no reason is selected', () => {
      expect(
        wrapper.component.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if a reason is selected', () => {
      wrapper.component
        .find('#type_CLERICAL_ERROR')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.component.update()
      expect(
        wrapper.component.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should to go summary page', () => {
      wrapper.component
        .find('#type_CLERICAL_ERROR')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.component.update()
      expect(
        wrapper.component.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should disable the continue button if other option is selected without specifying the reason', () => {
      wrapper.component
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.component.update()
      expect(
        wrapper.component.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if other option is selected with the reason specified', () => {
      wrapper.component
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.component.update()

      wrapper.component
        .find('input[name="type.nestedFields.otherReason"]')
        .simulate('change', {
          target: {
            name: 'type.nestedFields.otherReason',
            value: 'Misspelling'
          }
        })
      wrapper.component.update()

      expect(
        wrapper.component.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should cancel the correction when the cross button is pressed', () => {
      wrapper.component.find('#crcl-btn').hostNodes().simulate('click')
      wrapper.component.update()

      expect(wrapper.router.state.location.pathname).toContain(
        WORKQUEUE_TABS.readyForReview
      )
    })
  })
})
