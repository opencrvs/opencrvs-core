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
  const graphqlMock = [
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        variables: { id: '6a5fd35d-01ec-4c37-976e-e055107a74a1' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            _fhirIDMap: {
              composition: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              encounter: 'cd56d5da-0c9d-471f-8e4a-e1db73856795',
              observation: {
                presentAtBirthRegistration:
                  '1590856c-ece2-456a-9141-24ca5961da63'
              }
            },
            id: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
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
            informant: null,
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
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
            father: null,
            registration: {
              id: '1440d427-7890-4a37-8f36-e9f65d725034',
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
            presentAtBirthRegistration: 'MOTHER',
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
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )
      component = testComponent.component
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
      component = (
        await createTestComponent(
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
          store,
          graphqlMock
        )
      ).component

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
  const graphqlMock = [
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        variables: { id: '6a5fd35d-01ec-4c37-976e-e055107a74a1' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            _fhirIDMap: {
              composition: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              encounter: 'cd56d5da-0c9d-471f-8e4a-e1db73856795',
              observation: {
                presentAtBirthRegistration:
                  '1590856c-ece2-456a-9141-24ca5961da63'
              }
            },
            id: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
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
              birthDate: new Date(
                new Date().getTime() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              gender: 'male',
              __typename: 'Person'
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
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
            father: null,
            informant: null,
            registration: {
              id: '1440d427-7890-4a37-8f36-e9f65d725034',
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
            presentAtBirthRegistration: 'MOTHER',
            __typename: 'BirthRegistration'
          }
        }
      }
    }
  ]

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
        store,
        graphqlMock
      )

      component = testComponent.component
    })

    it('continue to review section when the mandatory fields are filled and birth event is before 45 days', async () => {
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
  const graphqlMock = [
    {
      request: {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        variables: { id: '6a5fd35d-01ec-4c37-976e-e055107a74a1' }
      },
      result: {
        data: {
          fetchBirthRegistration: {
            _fhirIDMap: {
              composition: '9f38ff8a-1265-4170-a462-1969c22921c6',
              encounter: '3d75a8a0-de9d-43ea-8a5c-ae5d2affbe94',
              observation: {
                presentAtBirthRegistration:
                  '9fe39fb5-5371-4451-b7cf-891ffe2aee5e'
              }
            },
            id: '9f38ff8a-1265-4170-a462-1969c22921c6',
            child: {
              id: 'e93917d2-efa0-48b1-bb23-698d3ab476ba',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'আব্দুল্লাহ',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Abdullah',
                  __typename: 'HumanName'
                }
              ],
              birthDate: '2019-08-01',
              gender: 'male',
              __typename: 'Person'
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
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
              id: 'ec8fd669-3e82-49e0-8612-c1996997b920',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'আব্দ আল্লাহ',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Abd Allah',
                  __typename: 'HumanName'
                }
              ],
              birthDate: null,
              maritalStatus: 'MARRIED',
              dateOfMarriage: null,
              educationalAttainment: null,
              nationality: ['BGD'],
              identifier: [
                {
                  id: '9876543212345',
                  type: 'NATIONAL_ID',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              address: [
                {
                  type: 'CURRENT',
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
                  type: 'PERMANENT',
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
            informant: null,
            registration: {
              id: '015bbd91-dd5a-4ed4-aa09-1edd14d6ad21',
              contact: 'MOTHER',
              contactRelationship: 'Contact Relation',
              contactPhoneNumber: '01722222222',
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
              trackingId: 'B16ASJM',
              registrationNumber: '2019333494B16ASJM7',
              __typename: 'Registration'
            },
            attendantAtBirth: null,
            weightAtBirth: null,
            birthType: null,
            eventLocation: null,
            presentAtBirthRegistration: 'MOTHER',
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
        store,
        graphqlMock
      )

      component = testComponent.component
    })

    it('father option will be available', async () => {
      const element = await waitForElement(component, '#type_FATHER')
      expect(element.hostNodes()).toHaveLength(1)
    })
  })
})

describe('Certificate collector test for a death registration', () => {
  const graphqlMock = [
    {
      request: {
        query: GET_DEATH_REGISTRATION_FOR_CERTIFICATION,
        variables: { id: '16ff35e1-3f92-4db3-b812-c402e609fb00' }
      },
      result: {
        data: {
          fetchDeathRegistration: {
            _fhirIDMap: { composition: '16ff35e1-3f92-4db3-b812-c402e609fb00' },
            id: '16ff35e1-3f92-4db3-b812-c402e609fb00',
            deceased: {
              id: '0bb33ec5-a580-46ee-ad2f-cd66e0c3fea2',
              name: [
                {
                  use: 'bn',
                  firstNames: '',
                  familyName: 'আব্দুসসালাম',
                  __typename: 'HumanName'
                },
                {
                  use: 'en',
                  firstNames: '',
                  familyName: 'Abdussalam',
                  __typename: 'HumanName'
                }
              ],
              birthDate: '1930-01-01',
              gender: 'male',
              maritalStatus: 'MARRIED',
              nationality: ['BGD'],
              identifier: [
                {
                  id: '123456789',
                  type: 'PASSPORT',
                  otherType: null,
                  __typename: 'IdentityType'
                }
              ],
              deceased: { deathDate: '2010-01-01', __typename: 'Deceased' },
              address: [
                {
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
              __typename: 'Person'
            },
            informant: {
              id: '51572207-cd39-4706-9092-e9333cb7f9a7',
              relationship: 'MOTHER',
              otherRelationship: null,
              individual: {
                id: 'dd6b4d7e-0a34-4048-b416-c33e4735c225',
                identifier: [
                  {
                    id: '123456789',
                    type: 'PASSPORT',
                    otherType: null,
                    __typename: 'IdentityType'
                  }
                ],
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
                nationality: ['BGD'],
                birthDate: null,
                telecom: [
                  {
                    system: 'phone',
                    value: '01733333333',
                    __typename: 'ContactPoint'
                  }
                ],
                address: [
                  {
                    type: 'CURRENT',
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
                    type: 'PERMANENT',
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
                __typename: 'Person'
              },
              __typename: 'RelatedPerson'
            },
            registration: {
              id: '9d14ad8a-3c7d-402f-a85a-d8c51f5178a3',
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
              type: 'DEATH',
              contact: 'OTHER',
              contactPhoneNumber: '+8801671010143',
              contactRelationship: 'Friend',
              trackingId: 'DUFPWEZ',
              registrationNumber: '2019333494DUFPWEZ4',
              __typename: 'Registration'
            },
            eventLocation: {
              id: '0b3f4aef-588b-4e18-9185-b8346337ad7d',
              type: 'PERMANENT',
              address: {
                type: 'PERMANENT',
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
              __typename: 'Location'
            },
            mannerOfDeath: 'HOMICIDE',
            causeOfDeathMethod: null,
            causeOfDeath: null,
            __typename: 'DeathRegistration'
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
              registrationId: '16ff35e1-3f92-4db3-b812-c402e609fb00',
              eventType: 'death',
              groupId: 'certCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store,
        graphqlMock
      )

      component = testComponent.component
    })

    it('applicant will be available', async () => {
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
                presentAtBirthRegistration:
                  '1590856c-ece2-456a-9141-24ca5961da63'
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
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
            primaryCaregiver: {
              reasonsNotApplying: [
                {
                  primaryCaregiverType: 'MOTHER',
                  reasonNotApplying: '',
                  isDeceased: true,
                  __typename: 'ReasonsNotApplying'
                },
                {
                  primaryCaregiverType: 'FATHER',
                  reasonNotApplying: '',
                  isDeceased: true,
                  __typename: 'ReasonsNotApplying'
                }
              ],
              __typename: 'PrimaryCaregiver'
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
                  type: 'PERMANENT',
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
                  type: 'CURRENT',
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
            presentAtBirthRegistration: 'OTHER',
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
        store,
        graphqlMock
      )
      component = testComponent.component
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
