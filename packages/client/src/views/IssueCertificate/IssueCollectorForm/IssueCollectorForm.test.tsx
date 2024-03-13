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
import React from 'react'
import { AppStore, createStore, IStoreState } from '@client/store'
import { createLocation, History } from 'history'
import { ReactWrapper } from 'enzyme'
import { IssueCollectorForm } from './IssueCollectorForm'
import {
  createTestComponent,
  flushPromises,
  getFileFromBase64String,
  inValidImageB64String,
  mockDeathDeclarationData,
  mockDeclarationData,
  selectOption,
  validImageB64String
} from '@client/tests/util'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { storeDeclaration } from '@client/declarations'
import { merge } from 'lodash'
import { vi } from 'vitest'
import { Event } from '@client/utils/gateway'
import { flush } from 'fetch-mock'
import { IssueCollectorFormForOthers } from './IssueFormForOthers'

let store: AppStore
let history: History
let location = createLocation('/')

const declarationsHistory = [
  {
    date: '2022-04-14T12:52:34.112+00:00',
    regStatus: 'CERTIFIED',
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

const birthDeclarationForIssuance = {
  id: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
  data: mockDeclarationData,
  event: Event.Birth
}

beforeEach(() => {
  const s = createStore()
  store = s.store
  history = s.history
  location = createLocation('/')
  history.location = location
})

describe('Certificate issue collector test for a birth registration without father details', () => {
  describe('Test collector group', () => {
    let component: ReactWrapper<{}, {}>

    beforeEach(async () => {
      const testComponent = await createTestComponent(
        <IssueCollectorForm
          location={location}
          history={history}
          //@ts-ignore
          declaration={birthDeclarationForIssuance}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              eventType: 'birth',
              groupId: 'collector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { history, store }
      )
      component = testComponent
    })

    it('father option will be available', async () => {
      expect(component.find('#type_FATHER').hostNodes()).toHaveLength(1)
    })

    it('continue button disabled when not selected', async () => {
      expect(
        component.find('#continue-button').hostNodes().props().disabled
      ).toBeTruthy()
    })

    describe('Test the component with certificate', () => {
      beforeEach(async () => {
        const updatedCertificateArray = [
          {
            collector: {
              type: 'FATHER'
            }
          }
        ]

        const updatedMockDeclarationData = {
          ...birthDeclarationForIssuance,
          data: {
            ...birthDeclarationForIssuance.data,
            registration: {
              ...birthDeclarationForIssuance.data.registration,
              certificates: updatedCertificateArray
            }
          }
        }

        const testComponent = await createTestComponent(
          <IssueCollectorForm
            location={location}
            history={history}
            //@ts-ignore
            declaration={updatedMockDeclarationData}
            match={{
              params: {
                registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
                groupId: 'collector'
              },
              isExact: true,
              path: '',
              url: ''
            }}
          />,
          { history, store }
        )
        component = testComponent
      })

      it('redirects to id check component upon FATHER option selection', async () => {
        component.find('#continue-button').hostNodes().simulate('click')
        component.update()
        expect(history.location.pathname).toBe(
          '/issue/check/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth/father'
        )
      })

      it('redirects to user form for other collector upon Someone else option selection', async () => {
        const updatedCertificateArray = [
          {
            collector: {
              type: 'OTHER'
            }
          }
        ]

        const updatedMockDeclarationData = {
          ...birthDeclarationForIssuance,
          data: {
            ...birthDeclarationForIssuance.data,
            registration: {
              ...birthDeclarationForIssuance.data.registration,
              certificates: updatedCertificateArray
            }
          }
        }

        const testComponent = await createTestComponent(
          <IssueCollectorForm
            location={location}
            history={history}
            //@ts-ignore
            declaration={updatedMockDeclarationData}
            match={{
              params: {
                registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
                groupId: 'collector'
              },
              isExact: true,
              path: '',
              url: ''
            }}
          />,
          { history, store }
        )
        component = testComponent

        component
          .find('#type_OTHER')
          .hostNodes()
          .simulate('change', { target: { value: 'OTHER' } })

        component.update()
        component.find('#continue-button').hostNodes().simulate('click')
        component.update()
        expect(history.location.pathname).toBe(
          '/issue/6a5fd35d-01ec-4c37-976e-e055107a74a1/otherCollector'
        )
      })
    })
  })

  describe('Test other collector group', () => {
    let component: ReactWrapper<{}, {}>
    beforeEach(async () => {
      const updatedCertificateArray = [
        {
          collector: {
            type: 'OTHER'
          }
        }
      ]

      const updatedMockDeclarationData = {
        ...birthDeclarationForIssuance,
        data: {
          ...birthDeclarationForIssuance.data,
          registration: {
            ...birthDeclarationForIssuance.data.registration,
            certificates: updatedCertificateArray
          }
        }
      }

      const testComponent = await createTestComponent(
        <IssueCollectorFormForOthers
          location={location}
          history={history}
          //@ts-ignore
          declaration={updatedMockDeclarationData}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              groupId: 'otherCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { history, store }
      )
      component = testComponent
    })

    it('continue button diabled when necessary fields are not filled', async () => {
      expect(
        component.find('#continue-button').hostNodes().props().disabled
      ).toBeTruthy()
    })
  })

  describe('After user submits all other collector details', async () => {
    let component: ReactWrapper<{}, {}>
    it('takes the user to payment view', async () => {
      const updatedCertificateArray = [
        {
          collector: {
            type: 'OTHER',
            iDType: 'NATIONAL_ID',
            iDTypeOther: '',
            iD: '123456678',
            firstName: 'Jon',
            lastName: 'Doe',
            relationship: 'Uncle'
          },
          hasShowedVerifiedDocument: false
        }
      ]

      const updatedMockDeclarationData = {
        ...birthDeclarationForIssuance,
        data: {
          ...birthDeclarationForIssuance.data,
          registration: {
            ...birthDeclarationForIssuance.data.registration,
            certificates: updatedCertificateArray
          }
        }
      }

      const testComponent = await createTestComponent(
        <IssueCollectorFormForOthers
          location={location}
          history={history}
          //@ts-ignore
          declaration={updatedMockDeclarationData}
          match={{
            params: {
              registrationId: '6a5fd35d-01ec-4c37-976e-e055107a74a1',
              groupId: 'otherCollector'
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        { history, store }
      )
      component = testComponent
      component.find('#continue-button').hostNodes().simulate('click')
      component.update()
      expect(history.location.pathname).toBe(
        '/issue/payment/6a5fd35d-01ec-4c37-976e-e055107a74a1/birth'
      )
    })
  })
})
