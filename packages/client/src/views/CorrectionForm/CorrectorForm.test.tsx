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
  mockDeathDeclarationData,
  createRouterProps
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CorrectorForm } from './CorrectorForm'
import { CorrectionSection } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { IDeclaration, storeDeclaration } from '@client/declarations'
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

let wrapper: ReactWrapper<{}, {}>

const birthDeclaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871160',
  data: mockDeclarationData,
  event: Event.Birth
}

const deathDeclaration: IDeclaration = {
  id: '72c18939-70c1-40b4-9b80-b162c4871161',
  data: mockDeathDeclarationData,
  event: Event.Death
}

const { store, history } = createStore()

describe('Corrector form', () => {
  describe('for a birth registration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: birthDeclaration.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: birthDeclaration.id,
                pageId: CorrectionSection.Corrector
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

    it('should disable the continue button if no option is selected', () => {
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if an option is selected', () => {
      wrapper
        .find('#relationship_FATHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })

    it('should go to verify section', () => {
      wrapper.find('#confirm_form').hostNodes().simulate('click')
      wrapper.update()
      expect(history.location.pathname).toContain('/verify/father')
    })
  })
  describe('for a birth registration with father details', () => {
    beforeEach(async () => {
      const declaration: IDeclaration = {
        ...birthDeclaration,
        data: {
          ...birthDeclaration.data,
          father: {
            ...birthDeclaration.data.father,
            detailsExist: true
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm declaration={declaration} />,
        {
          store,
          history
        }
      )
    })
    it('should show the father option', () => {
      expect(wrapper.find('#relationship_FATHER').hostNodes()).toHaveLength(1)
    })
  })

  describe('for a birth registration without father details', () => {
    beforeEach(async () => {
      const declaration: IDeclaration = {
        ...birthDeclaration,
        data: {
          ...birthDeclaration.data,
          father: {
            ...birthDeclaration.data.father,
            detailsExist: false
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm declaration={declaration} />,
        {
          store,
          history
        }
      )
    })
    it('should not show the father option', () => {
      expect(wrapper.exists('#relationship_FATHER')).toBeFalsy()
    })
  })

  describe('for a death registration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(deathDeclaration))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: deathDeclaration.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: deathDeclaration.id,
                pageId: CorrectionSection.Corrector
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

    it('should disable the continue button if no option is selected', () => {
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if an option is selected', () => {
      wrapper
        .find('#relationship_INFORMANT')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })
  })

  describe('for an declaration', () => {
    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              declarationId: birthDeclaration.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                declarationId: birthDeclaration.id,
                pageId: CorrectionSection.Corrector
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

    it('should disable the continue button if others option is selected without specifying the relationship', () => {
      wrapper
        .find('#relationship_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeTruthy()
    })

    it('should not disable the continue button if others option is selected with the relationship specified', () => {
      wrapper
        .find('#relationship_OTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()

      wrapper
        .find('input[name="relationship.nestedFields.otherRelationship"]')
        .simulate('change', {
          target: {
            name: 'relationship.nestedFields.otherRelationship',
            value: 'Grandma'
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

      expect(history.location.pathname).toContain(WORKQUEUE_TABS.readyForReview)
    })
  })
})
