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
import { AppStore, createStore } from '@client/store'
import {
  createTestComponent,
  selectOption,
  getFileFromBase64String,
  validImageB64String,
  inValidImageB64String,
  mockDeclarationData,
  mockDeathDeclarationData,
  mockMarriageDeclarationData
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CollectorForm } from './CollectorForm'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { createLocation, History } from 'history'
import { merge } from 'lodash'
import { Event } from '@client/utils/gateway'
import { storeDeclaration } from '@client/declarations'
import { lateBirthCertificationResponseWithFather } from '@client/tests/mock-graphql-responses'
import { vi } from 'vitest'

let store: AppStore
let history: History
let location = createLocation('/')

const declarationsHistory = [
  {
    date: '2022-04-14T12:52:34.112+00:00',
    action: 'DOWNLOADED',
    regStatus: 'DECLARED',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    signature: null,
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  },
  {
    date: '2022-04-14T12:52:25.951+00:00',
    regStatus: 'REGISTERED',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  },
  {
    date: '2022-04-14T12:52:25.798+00:00',
    regStatus: 'WAITING_VALIDATION',
    statusReason: null,
    location: {
      id: '852b103f-2fe0-4871-a323-51e51c6d9198',
      name: 'Ibombo',
      __typename: 'Location'
    },
    office: {
      id: '204f706f-e097-4394-9d12-bd50f057f923',
      name: 'Ibombo District Office',
      __typename: 'Location'
    },
    user: {
      id: '6241918dd6dc544f60d8f73a',
      type: 'CHAIRMAN',
      role: 'LOCAL_REGISTRAR',
      name: [
        {
          firstNames: 'Kennedy',
          familyName: 'Mweene',
          use: 'en',
          __typename: 'HumanName'
        }
      ],
      avatar: null,
      __typename: 'User'
    },
    comments: [],
    input: [],
    output: [],
    certificates: null,
    __typename: 'History'
  }
]

//@ts-ignore
mockDeclarationData['history'] = declarationsHistory

const birthDeclaration = {
  id: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
  data: mockDeclarationData,
  event: Event.Birth
}

const deathDeclaration = {
  id: '16ff35e1-3f92-4db3-b812-c402e609fb00',
  data: mockDeathDeclarationData,
  event: Event.Death
}

const marriageDeclaration = {
  id: '18ff35e1-3d92-4db3-b815-c4d2e609fb23',
  data: mockMarriageDeclarationData,
  event: Event.Death
}

beforeEach(() => {
  const s = createStore()
  store = s.store
  history = s.history
  location = createLocation('/')
  history.location = location
})

describe('Certificate collector test for a birth registration without father details', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      //@ts-ignore
      store.dispatch(storeDeclaration(birthDeclaration))
      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { history, store }
      )
      component = testComponent
      await waitForElement(component, '#collector_form')
    })

    it('father option will be available', async () => {
      await waitForElement(component, '#type_FATHER')
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(1)
    })

    it('prompt error when no option is selected', async () => {
      component.find('#confirm_form').hostNodes().simulate('click')
      await waitForElement(component, '#form_error')
      expect(component.find('#form_error').hostNodes().text()).toBe(
        'Please select who is collecting the certificate'
      )
    })

    it('redirects to id check component upon FATHER option selection', async () => {
      component
        .find('#type_FATHER')
        .hostNodes()
        .simulate('change', { target: { value: 'FATHER' } })

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      expect(history.location.pathname).toBe(
        '/print/check/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/father'
      )
    })

    it('should redirects back to certificate collector option selection with father already selected', async () => {
      component
        .find('#type_FATHER')
        .hostNodes()
        .simulate('change', { target: { value: 'FATHER' } })
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      component.find('#action_page_back_button').hostNodes().simulate('click')
      component.update()
      expect(component.find('#type_FATHER').hostNodes().props().checked).toBe(
        true
      )
    })

    it('redirects to user form for other collector upon Someone else option selection', async () => {
      component
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'OTHER' } })

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      component.find('#confirm_form').hostNodes().simulate('click')
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()
      expect(history.location.pathname).toBe(
        '/cert/collector/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/otherCertCollector'
      )
    })
  })

  describe('Test other collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      /*
       * Who is collecting the certificate?
       */
      store.dispatch(storeDeclaration(birthDeclaration))
      component = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      const form = await waitForElement(component, '#collector_form')

      // Set collector to someone else
      // done manually so the store is correctly updated
      form
        .find('#type_OTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'OTHER' } })

      // Continue
      form.find('#confirm_form').hostNodes().simulate('click')

      /*
       * Change view manually
       */
      component.setProps(
        merge({}, component.props(), {
          match: {
            params: {
              groupId: 'otherCertCollector'
            }
          }
        })
      )

      // Wait until next view is loaded
      await waitForElement(component, '#iDType')
    })

    it('show form level error when the mandatory fields are not filled', async () => {
      component.find('#confirm_form').hostNodes().simulate('click')
      await waitForElement(component, '#form_error')
      expect(component.find('#form_error').hostNodes().text()).toBe(
        'Complete all the mandatory fields'
      )
    })

    describe('After user submits all other collector details', () => {
      beforeEach(async () => {
        await selectOption(
          component,
          '#iDType',
          'National ID number (in English)'
        )

        component
          .find('#iD')
          .hostNodes()
          .simulate('change', { target: { value: '123456789', id: 'iD' } })

        component
          .find('#firstName')
          .hostNodes()
          .simulate('change', { target: { value: 'Jon', id: 'firstName' } })

        component
          .find('#lastName')
          .hostNodes()
          .simulate('change', { target: { value: 'Doe', id: 'lastName' } })

        component
          .find('#relationship')
          .hostNodes()
          .simulate('change', {
            target: { value: 'Uncle', id: 'relationship' }
          })

        const $confirm = await waitForElement(component, '#confirm_form')
        $confirm.hostNodes().simulate('click')

        component.setProps(
          merge({}, component.props(), {
            match: {
              params: {
                groupId: 'affidavit'
              }
            }
          })
        )
        await waitForElement(component, '#image_file_uploader_field')
      })
      it('takes the user to affedavit view', async () => {
        expect(history.location.pathname).toBe(
          '/cert/collector/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/affidavit'
        )
      })

      it('show form level error when the mandatory fields are not filled', async () => {
        component.find('#confirm_form').hostNodes().simulate('click')
        await waitForElement(component, '#form_error')
        expect(component.find('#form_error').hostNodes().text()).toBe(
          'Upload signed affidavit or click the checkbox if they do not have one.'
        )
      })

      it('shows form level error when invalid type of file is uploaded as affidavit file', async () => {
        component
          .find('#image_file_uploader_field')
          .hostNodes()
          .simulate('change', {
            target: {
              files: [
                getFileFromBase64String(
                  inValidImageB64String,
                  'index.svg',
                  'image/svg'
                )
              ]
            }
          })
        waitFor(() => component.find('#field_error').hostNodes().length > 0)
      })

      it('continue to payment section when the mandatory fields are filled and birth event is between 45 days and 5 years', async () => {
        Date.now = vi.fn(() => 1538352000000) // 2018-10-01
        await waitForElement(component, '#noAffidavitAgreementAFFIDAVIT')
        component
          .find('#noAffidavitAgreementAFFIDAVIT')
          .hostNodes()
          .simulate('change', {
            checked: true
          })

        await waitForElement(component, '#confirm_form')
        component.find('#confirm_form').hostNodes().simulate('click')
        await waitForElement(
          component,
          '#noAffidavitAgreementConfirmationModal'
        )
        expect(
          component.find('#noAffidavitAgreementConfirmationModal').hostNodes()
        ).toHaveLength(1)

        component.find('#submit_confirm').hostNodes().simulate('click')

        expect(history.location.pathname).toBe(
          '/print/payment/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
        )
      })

      it('continue to review section when the mandatory fields are filled and birth event is before target days', async () => {
        birthDeclaration.data.child.childBirthDate = '2022-09-20'
        store.dispatch(storeDeclaration(birthDeclaration))
        const comp = await waitForElement(
          component,
          '#noAffidavitAgreementAFFIDAVIT'
        )
        comp.hostNodes().simulate('change', {
          checked: true
        })

        await new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
        component.update()
        component.find('#confirm_form').hostNodes().simulate('click')
        expect(
          component.find('#noAffidavitAgreementConfirmationModal').hostNodes()
        ).toHaveLength(1)
        component.find('#submit_confirm').hostNodes().simulate('click')
        expect(history.location.pathname).toBe(
          '/review/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
        )
      })

      it('should hide form level error while uploading valid file', async () => {
        const $confirm = await waitForElement(component, '#confirm_form')
        $confirm.hostNodes().simulate('click')
        await waitForElement(component, '#form_error')
        component
          .find('#image_file_uploader_field')
          .hostNodes()
          .simulate('change', {
            target: {
              files: [
                getFileFromBase64String(
                  validImageB64String,
                  'index.png',
                  'image/png'
                )
              ]
            }
          })
        waitFor(() => component.find('#form_error').hostNodes().length === 0)
      })
    })
  })
})

describe('Certificate collector test for a birth registration with father details', () => {
  const { store, history } = createStore()
  const mockLocation: any = vi.fn()
  const graphqlMock = lateBirthCertificationResponseWithFather

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      store.dispatch(storeDeclaration(birthDeclaration))

      const testComponent = await createTestComponent(
        <CollectorForm
          location={mockLocation}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      component = testComponent
    })

    it('father option will be available', async () => {
      const element = await waitForElement(component, '#type_FATHER')
      expect(element.hostNodes()).toHaveLength(1)
    })
  })
})

describe('Certificate collector test for a death registration', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      store.dispatch(storeDeclaration(deathDeclaration))

      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '16ff35e1-3f92-4db3-b812-c402e609fb00',
              eventType: 'death',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      component = testComponent
    })

    it('informant will be available', async () => {
      const element = await waitForElement(component, '#type_INFORMANT')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('redirects to review certificate for print in advance option', async () => {
      const $printInAdvance = await waitForElement(
        component,
        '#type_PRINT_IN_ADVANCE'
      )
      $printInAdvance
        .hostNodes()
        .simulate('change', { target: { value: 'PRINT_IN_ADVANCE' } })

      const $confirm = await waitForElement(component, '#confirm_form')
      $confirm.hostNodes().simulate('click')

      expect(history.location.pathname).toBe(
        '/review/16ff35e1-3f92-4db3-b812-c402e609fb00/death'
      )
    })
  })
})

describe('Certificate collector test for a marriage registration', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      store.dispatch(storeDeclaration(marriageDeclaration))

      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '18ff35e1-3d92-4db3-b815-c4d2e609fb23',
              eventType: 'marriage',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )

      component = testComponent
    })

    it('groom will be available', async () => {
      const element = await waitForElement(component, '#type_GROOM')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('bride will be available', async () => {
      const element = await waitForElement(component, '#type_BRIDE')
      expect(element.hostNodes()).toHaveLength(1)
    })

    it('redirects to review certificate for print in advance option', async () => {
      const $printInAdvance = await waitForElement(
        component,
        '#type_PRINT_IN_ADVANCE'
      )
      $printInAdvance
        .hostNodes()
        .simulate('change', { target: { value: 'PRINT_IN_ADVANCE' } })

      const $confirm = await waitForElement(component, '#confirm_form')
      $confirm.hostNodes().simulate('click')

      expect(history.location.pathname).toBe(
        '/review/18ff35e1-3d92-4db3-b815-c4d2e609fb23/marriage'
      )
    })
  })
})

describe('Certificate collector test for a birth registration without father and mother details', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      //@ts-ignore
      delete birthDeclaration['data']['father']
      store.dispatch(storeDeclaration(birthDeclaration))
      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history }
      )
      component = testComponent
      await waitForElement(component, '#collector_form')
    })

    it('father option will not be available', () => {
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(0)
    })

    it('mother option will be available', () => {
      expect(component.find('#type_MOTHER').hostNodes()).toHaveLength(1)
    })
  })
})
