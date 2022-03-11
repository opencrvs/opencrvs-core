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
  mockDeclarationData,
  createRouterProps
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { Event, CorrectionSection } from '@client/forms'
import { IDeclaration, storeDeclaration } from '@client/declarations'
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'

let wrapper: ReactWrapper<{}, {}>

const birthDeclaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: mockDeclarationData,
  event: Event.BIRTH
}

const { store, history } = createStore()

describe('Correction reason form', () => {
  describe('for an declaration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: birthDeclaration.id,
              pageId: CorrectionSection.Reason
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: birthDeclaration.id,
                pageId: CorrectionSection.Reason
              }
            }
          )}
        />,
        {
          store,
          history
        }
      )
    })
    it('should disable the continue button if no reason is selected', () => {
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if a reason is selected', () => {
      wrapper
        .find('#type_CLERICAL_ERROR')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should to go summary page', () => {
      wrapper
        .find('#type_CLERICAL_ERROR')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should disable the continue button if other option is selected without specifying the reason', () => {
      wrapper
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if other option is selected with the reason specified', () => {
      wrapper
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()

      wrapper
        .find('input[name="type.nestedFields.reasonForChange"]')
        .simulate('change', {
          target: {
            name: 'type.nestedFields.reasonForChange',
            value: 'Misspelling'
          }
        })
      wrapper.update()

      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should cancel the correction when the cross button is pressed', () => {
      wrapper.find('#crcl-btn').hostNodes().simulate('click')
      wrapper.update()

      expect(history.location.pathname).toContain('/review')
    })
  })
})
