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
  mockDeathApplicationData
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CorrectorForm } from './CorrectorForm'
import { waitForElement } from '@client/tests/wait-for-element'
import { Event } from '@client/forms'
import { IApplication } from '@client/applications'

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
      wrapper = await createTestComponent(
        <CorrectorForm application={birthApplication} />,
        {
          store,
          history
        }
      )

      await waitForElement(wrapper, '#corrector_form')
    })

    it('should show the child option', () => {
      expect(wrapper.find('#relationship_CHILD').hostNodes()).toHaveLength(1)
    })

    it('should show the legal guardian option', () => {
      expect(
        wrapper.find('#relationship_LEGAL_GUARDIAN').hostNodes()
      ).toHaveLength(1)
    })

    it('should show the another agent option', () => {
      expect(
        wrapper.find('#relationship_ANOTHER_AGENT').hostNodes()
      ).toHaveLength(1)
    })

    it('should show the registrar option', () => {
      expect(wrapper.find('#relationship_REGISTRAR').hostNodes()).toHaveLength(
        1
      )
    })

    it('should show the registrar option', () => {
      expect(wrapper.find('#relationship_COURT').hostNodes()).toHaveLength(1)
    })

    it('should show the others option', () => {
      expect(wrapper.find('#relationship_OTHERS').hostNodes()).toHaveLength(1)
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

      await waitForElement(wrapper, '#corrector_form')
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

      await waitForElement(wrapper, '#corrector_form')
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

      await waitForElement(wrapper, '#corrector_form')
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

      await waitForElement(wrapper, '#corrector_form')
    })
    it('should not show the mother option', () => {
      expect(wrapper.exists('#relationship_MOTHER')).toBeFalsy()
    })
  })

  describe('for a death registration', () => {
    beforeEach(async () => {
      const application: IApplication = {
        ...deathApplication,
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

      await waitForElement(wrapper, '#corrector_form')
    })

    it('should show the informant option', () => {
      expect(wrapper.find('#relationship_INFORMANT').hostNodes()).toHaveLength(
        1
      )
    })

    it('should show the another agent option', () => {
      expect(
        wrapper.find('#relationship_ANOTHER_AGENT').hostNodes()
      ).toHaveLength(1)
    })

    it('should show the registrar option', () => {
      expect(wrapper.find('#relationship_REGISTRAR').hostNodes()).toHaveLength(
        1
      )
    })

    it('should show the court option', () => {
      expect(wrapper.find('#relationship_COURT').hostNodes()).toHaveLength(1)
    })

    it('should show the others option', () => {
      expect(wrapper.find('#relationship_OTHERS').hostNodes()).toHaveLength(1)
    })
  })
})
