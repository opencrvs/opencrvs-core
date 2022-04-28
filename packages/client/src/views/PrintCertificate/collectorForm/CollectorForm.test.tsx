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
  validImageB64String
} from '@client/tests/util'
import { GET_BIRTH_REGISTRATION_FOR_CERTIFICATE } from '@client/views/DataProvider/birth/queries'
import { GET_DEATH_REGISTRATION_FOR_CERTIFICATION } from '@client/views/DataProvider/death/queries'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { CollectorForm } from './CollectorForm'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { createLocation, History } from 'history'
import { merge } from 'lodash'
import {
  deathCertificationResponse,
  lateBirthCertificationResponse,
  lateBirthCertificationResponseWithFather,
  onTimeBirthCertificationResponse
} from '@client/tests/mock-graphql-responses'

let store: AppStore
let history: History
let location = createLocation('/')

beforeEach(() => {
  const s = createStore()
  store = s.store
  history = s.history
  location = createLocation('/')
  history.location = location
})

describe('Certificate collector test for a birth registration without father details', () => {
  const graphqlMock = lateBirthCertificationResponse

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
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
        { history, store, graphqlMocks: graphqlMock }
      )
      component = testComponent
      await waitForElement(component, '#collector_form')
    })

    it('father option will not be available', () => {
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(0)
    })

    it('prompt error when no option is selected', async () => {
      component.find('#confirm_form').hostNodes().simulate('click')

      await waitForElement(component, '#form_error')

      expect(component.find('#form_error').hostNodes().text()).toBe(
        'Please select who is collecting the certificate'
      )
    })

    it('redirects to id check component upon MOTHER option selection', async () => {
      component
        .find('#type_MOTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'MOTHER' } })

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
        '/print/check/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/mother'
      )
    })

    it('should redirects back to certificate collector option selection with mother already selected', async () => {
      component
        .find('#type_MOTHER')
        .hostNodes()
        .simulate('change', { target: { value: 'MOTHER' } })

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

      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
      component.update()

      expect(component.find('#type_MOTHER').hostNodes().props().checked).toBe(
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
        { store, history, graphqlMocks: graphqlMock }
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
          'Attach a signed affidavit or click the checkbox if they do not have one.'
        )
      })

      it('continue to payment section when the mandatory fields are filled and birth event is between 45 days and 5 years', async () => {
        Date.now = jest.fn(() => 1538352000000) // 2018-10-01
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
          '/payment/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
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

describe('Test for a free birth registration', () => {
  const graphqlMock = onTimeBirthCertificationResponse

  describe('Test affidavit group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'affidavit'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history, graphqlMocks: graphqlMock }
      )

      component = testComponent
    })

    it('continue to review section when the mandatory fields are filled and birth event is before target days', async () => {
      ;(await waitForElement(component, '#noAffidavitAgreementAFFIDAVIT'))
        .hostNodes()
        .simulate('change', {
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
  })
})

describe('Certificate collector test for a birth registration with father details', () => {
  const { store, history } = createStore()
  const mockLocation: any = jest.fn()
  const graphqlMock = lateBirthCertificationResponseWithFather

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
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
        { store, history, graphqlMocks: graphqlMock }
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
  const graphqlMock = deathCertificationResponse

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
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
        { store, history, graphqlMocks: graphqlMock }
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

describe('Certificate collector test for a birth registration without father and mother details', () => {
  const graphqlMock = [
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        variables: { id: '6a5fd35d-01ec-4c37-976e-e055107at5674' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            _fhirIDMap: {
              composition: '6a5fd35d-01ec-4c37-976e-e055107at5674',
              encounter: 'cd56d5da-0c9d-471f-8e4a-e1db73856795',
              observation: {
                informantType: '1590856c-ece2-456a-9141-24ca5961da63'
              }
            },
            id: '6a5fd35d-01ec-4c37-976e-e055107at5674',
            child: {
              id: '8ad1796f-de75-4e62-ad3d-a0b38bbbc281',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'ইসলাম',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Islam',
                  __typename: 'HumanName'
                }
              ],
              birthDate: '2018-08-01',
              gender: 'male',
              __typename: 'Person'
            },
            informant: {
              id: '0df90d42-1615-4ffd-9f47-b6a30a9ddae1',
              individual: {
                id: '9c6c68c7-6bb0-4e40-a3bf-8cac6448ac2e',
                name: [
                  {
                    use: 'bn',
                    firstNames: '',
                    familyName: 'রোয়া',
                    __typename: 'HumanName'
                  },
                  {
                    use: 'en',
                    firstNames: '',
                    familyName: 'Roya',
                    __typename: 'HumanName'
                  }
                ]
              }
            },
            mother: {
              id: '22aa4ca0-e5ec-49ec-8574-39a799f57a65',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'রোকেয়া',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Rokeya',
                  __typename: 'HumanName'
                }
              ],
              detailsExist: false,
              birthDate: null,
              maritalStatus: 'MARRIED',
              dateOfMarriage: null,
              educationalAttainment: null,
              nationality: ['BGD'],
              multipleBirth: 1,
              identifier: [
                {
                  id: '1234567890987',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              address: [
                {
                  type: 'PRIMARY_ADDRESS',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                  ],
                  district: '68ba789b-0e6c-4528-a400-4422e142e3dd',
                  state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                },
                {
                  type: 'SECONDARY_ADDRESS',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                  ],
                  district: '68ba789b-0e6c-4528-a400-4422e142e3dd',
                  state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                }
              ],
              telecom: null,
              __typename: 'Person'
            },
            father: {
              id: '22aa4ca0-e5ec-49ec-8574-39a799f57aw5',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'হাসান',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'hasan',
                  __typename: 'HumanName'
                }
              ],
              birthDate: null,
              detailsExist: false,
              maritalStatus: 'MARRIED',
              dateOfMarriage: null,
              educationalAttainment: null,
              nationality: ['BGD'],
              multipleBirth: 1,
              identifier: [
                {
                  id: '1234567890934',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              address: [
                {
                  type: 'PRIMARY_ADDRESS',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                  ],
                  district: '68ba789b-0e6c-4528-a400-4422e142e3dd',
                  state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                },
                {
                  type: 'SECONDARY_ADDRESS',
                  line: [
                    '',
                    '',
                    '',
                    '',
                    '',
                    'f8816522-0a1a-49ca-aa4e-a886a9b056ec'
                  ],
                  district: '68ba789b-0e6c-4528-a400-4422e142e3dd',
                  state: 'd2898740-42e4-4680-b5a7-2f0a12a15199',
                  postalCode: null,
                  country: 'BGD',
                  __typename: 'Address'
                }
              ],
              telecom: null,
              __typename: 'Person'
            },
            registration: {
              id: '1440d427-7890-4a37-8f36-e9f65d725034',
              informantType: 'MOTHER',
              contact: 'MOTHER',
              contactRelationship: 'Contact Relation',
              contactPhoneNumber: '01711111111',
              attachments: null,
              status: [
                {
                  comments: null,
                  type: 'REGISTERED',
                  location: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    __typename: 'Location'
                  },
                  office: {
                    name: 'Moktarpur Union Parishad',
                    alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
                    address: {
                      district: 'Gazipur',
                      state: 'Dhaka',
                      __typename: 'Address'
                    },
                    __typename: 'Location'
                  },
                  __typename: 'RegWorkflow'
                }
              ],
              trackingId: 'BWOY6PW',
              registrationNumber: '2019333494BWOY6PW8',
              __typename: 'Registration'
            },
            attendantAtBirth: null,
            weightAtBirth: null,
            birthType: null,
            eventLocation: null,
            __typename: 'BirthRegistration'
          }
        }
      }
    }
  ]

  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <CollectorForm
          location={location}
          history={history}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107at5674',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { store, history, graphqlMocks: graphqlMock }
      )
      component = testComponent
      await waitForElement(component, '#collector_form')
    })

    it('father option will not be available', () => {
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(0)
    })

    it('mother option will not be available', () => {
      expect(component.find('#type_MOTHER').hostNodes()).toHaveLength(0)
    })
  })
})
