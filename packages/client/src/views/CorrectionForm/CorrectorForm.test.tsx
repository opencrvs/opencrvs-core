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
  mockApplicationData,
  mockDeathApplicationData,
  createRouterProps
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CorrectorForm } from './CorrectorForm'
import { Event, CorrectionSection } from '@client/forms'
import { IApplication, storeApplication } from '@client/applications'
import { CorrectionForm } from './CorrectionForm'
import { formatUrl } from '@client/navigation'
import { CERTIFICATE_CORRECTION } from '@client/navigation/routes'

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

describe('Corrector form', () => {
  describe('for a birth registration', () => {
    beforeEach(async () => {
      store.dispatch(storeApplication(birthApplication))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              applicationId: birthApplication.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                applicationId: birthApplication.id,
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
        .find('#relationship_MOTHER')
        .hostNodes()
        .simulate('change', { target: { checked: true } })
      wrapper.update()
      expect(
        wrapper.find('#confirm_form').hostNodes().props().disabled
      ).toBeFalsy()
    })
  })
  describe('for a birth registration with father details', () => {
    beforeEach(async () => {
      const application: IApplication = {
        ...birthApplication,
        data: {
          ...birthApplication.data,
          father: {
            ...birthApplication.data.father,
            fathersDetailsExist: true
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm application={application} />,
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
      const application: IApplication = {
        ...birthApplication,
        data: {
          ...birthApplication.data,
          father: {
            ...birthApplication.data.father,
            fathersDetailsExist: false
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm application={application} />,
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

  describe('for a birth registration with father deceased', () => {
    beforeEach(async () => {
      const application: IApplication = {
        ...birthApplication,
        data: {
          ...birthApplication.data,
          primaryCaregiver: {
            ...birthApplication.data.primaryCaregiver,
            fatherIsDeceased: ['deceased']
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm application={application} />,
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

  describe('for a birth registration with mother deceased', () => {
    beforeEach(async () => {
      const application: IApplication = {
        ...birthApplication,
        data: {
          ...birthApplication.data,
          primaryCaregiver: {
            ...birthApplication.data.primaryCaregiver,
            motherIsDeceased: ['deceased']
          }
        }
      }
      wrapper = await createTestComponent(
        <CorrectorForm application={application} />,
        {
          store,
          history
        }
      )
    })
    it('should not show the mother option', () => {
      expect(wrapper.exists('#relationship_MOTHER')).toBeFalsy()
    })
  })

  describe('for a death registration', () => {
    beforeEach(async () => {
      store.dispatch(storeApplication(deathApplication))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              applicationId: deathApplication.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                applicationId: deathApplication.id,
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

  describe('for an application', () => {
    beforeEach(async () => {
      store.dispatch(storeApplication(birthApplication))
      wrapper = await createTestComponent(
        <CorrectionForm
          {...createRouterProps(
            formatUrl(CERTIFICATE_CORRECTION, {
              applicationId: birthApplication.id,
              pageId: CorrectionSection.Corrector
            }),
            { isNavigatedInsideApp: false },
            {
              matchParams: {
                applicationId: birthApplication.id,
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

      expect(history.location.pathname).toContain('/review')
    })
  })
})
