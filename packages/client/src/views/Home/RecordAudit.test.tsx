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

import * as React from 'react'
import {
  createTestComponent,
  mockApplicationData,
  createRouterProps,
  registerScopeToken,
  getItem,
  flushPromises
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createApplication,
  storeApplication,
  IApplication,
  SUBMISSION_STATUS,
  getApplicationsOfCurrentUser,
  IUserData,
  modifyApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { formatUrl } from '@client/navigation'
import { APPLICATION_RECORD_AUDIT } from '@client/navigation/routes'
import { GQLBirthEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { checkAuth } from '@client/profile/profileActions'
import { REINSTATE_BIRTH_APPLICATION } from '@client/views/DataProvider/birth/mutations'
import { IUserDetails } from '@client/utils/userUtils'
import { storage } from '@client/storage'

const application: IApplication = createApplication(
  Event.BIRTH,
  mockApplicationData
)
application.data.registration = {
  ...application.data.registration,
  presentAtBirthRegistration: 'MOTHER',
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01557394986' }
  }
}

describe('Record audit summary for applicationState', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    store.dispatch(storeApplication(application))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            applicationId: application.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: application.id
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Record Audit page loads properly', async () => {
    expect(component.find('#recordAudit').hostNodes()).toHaveLength(1)
    expect(component.find('#summary').length).toEqual(14)
  })
  it('Check values for saved applications', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe('Draft')
    expect(component.find('#type_value').hostNodes().text()).toBe('Birth')
    expect(component.find('#brn_value').hostNodes().text()).toBe(
      '201908122365BDSS0SE1'
    )
    expect(component.find('#placeOfBirth_value').hostNodes()).toHaveLength(1)
  })
})

describe('Record audit summary for WorkQueue Applications', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    store.getState().workqueueState.workqueue.data.inProgressTab.results = [
      {
        id: 'db097901-feba-4f71-a1ae-d3d46289d2d5',
        type: 'Birth',
        registration: {
          status: 'DRAFT',
          contactNumber: '+8801622688231',
          trackingId: 'BN99CGM',
          registeredLocationId: '425b9cab-6ec3-47b3-bb8b-aee1b1afe4fc',
          createdAt: '1597657903690'
        },
        operationHistories: [
          {
            operationType: 'DRAFT',
            operatedOn: '2020-08-17T09:51:43.350Z',
            operatorRole: 'FIELD_AGENT',
            operatorName: [
              {
                firstNames: 'Shakib',
                familyName: 'Al Hasan',
                use: 'en'
              },
              {
                firstNames: 'সাকিব',
                familyName: 'হাসান',
                use: 'bn'
              }
            ],
            operatorOfficeName: 'Baniajan Union Parishad',
            operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ']
          }
        ],
        childName: [
          {
            firstNames: 'Shakib',
            familyName: 'Al Hasan',
            use: 'en'
          },
          {
            firstNames: 'সাকিব',
            familyName: 'হাসান',
            use: 'bn'
          }
        ]
      } as GQLBirthEventSearchSet
    ]

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            applicationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Record Audit page loads properly', async () => {
    expect(component.find('#recordAudit').hostNodes()).toHaveLength(1)
    expect(component.find('#summary').length).toEqual(12)
  })

  it('Check values for WQ applications', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe('Draft')
    expect(component.find('#type_value').hostNodes().text()).toBe('Birth')
    expect(component.find('#content-name').hostNodes().text()).toBe(
      'Shakib Al Hasan'
    )
    expect(component.find('#placeOfBirth_grey').hostNodes()).toHaveLength(1)
    expect(component.find('#placeOfDeath_grey').hostNodes()).toHaveLength(0)
  })
})

describe('Record audit', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    getItem.mockReturnValue(registerScopeToken)

    await store.dispatch(checkAuth({ '?token': registerScopeToken }))

    application.submissionStatus = SUBMISSION_STATUS.DECLARED
    store.dispatch(storeApplication(application))

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            applicationId: application.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: application.id
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('should show the archive button', async () => {
    expect(component.exists('#archive_button')).toBeTruthy()
  })

  it('should show the confirmation modal when archive button is clicked', async () => {
    component.find('#archive_button').hostNodes().simulate('click')

    component.update()

    expect(component.find('ResponsiveModal').prop('show')).toBeTruthy()
  })

  it('should close the confirmation modal when cancel button is clicked', async () => {
    component.find('#archive_button').hostNodes().simulate('click')

    component.update()

    component.find('#cancel-btn').hostNodes().simulate('click')

    component.update()

    expect(component.find('ResponsiveModal').prop('show')).toBe(false)
  })
})

describe('Record audit reinstated button', () => {
  const currentUserData: IUserData = {
    userID: '123',
    applications: [
      { ...createApplication(Event.BIRTH), submissionStatus: 'ARCHIVED' }
    ]
  }
  const currentUserDetails: IUserDetails = {
    language: 'en',
    userMgntUserID: '123',
    localRegistrar: { name: [] }
  }
  const indexedDB = {
    USER_DATA: JSON.stringify([currentUserData]),
    USER_DETAILS: JSON.stringify(currentUserDetails)
  }
  beforeEach(() => {
    // Mocking storage reading
    // @ts-ignore
    storage.getItem = jest.fn((key: string) => {
      switch (key) {
        case 'USER_DATA':
        case 'USER_DETAILS':
          return indexedDB[key]
        default:
          return undefined
      }
    })
    // Mocking storage writing
    // @ts-ignore
    storage.setItem = jest.fn((key: string, value: string) => {
      switch (key) {
        case 'USER_DATA':
        case 'USER_DETAILS':
          indexedDB[key] = value
          break
        default:
          break
      }
    })
  })
  const graphqlMock = [
    {
      request: {
        query: REINSTATE_BIRTH_APPLICATION,
        variables: {
          id: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          // @ts-ignore
          markApplicationAsReinstated: '450ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      }
    }
  ]
  let component: ReactWrapper<{}, {}>
  beforeEach(async () => {
    const { store, history } = createStore()
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth({ '?token': registerScopeToken }))
    await store.dispatch(storeApplication(application))
    application.submissionStatus = 'ARCHIVED'
    await store.dispatch(modifyApplication(application))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            applicationId: application.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              applicationId: application.id
            }
          }
        )}
      />,
      { store, history, graphqlMocks: graphqlMock }
    )
    component.update()
    await flushPromises()
  })
  it('Should show reinstated button', async () => {
    expect(component.find('#reinstate_button').hostNodes()).toHaveLength(1)
  })
  it('Should show modal if click on reinstated button', async () => {
    component.find('#reinstate_button').hostNodes().simulate('click')
    component.update()
    expect(component.find('ResponsiveModal').prop('show')).toBe(true)
  })
  it('Should close the modal if click on cancel button', async () => {
    component.find('#reinstate_button').hostNodes().simulate('click')
    component.update()
    component.find('#cancel-btn').hostNodes().simulate('click')
    component.update()
    expect(component.find('ResponsiveModal').prop('show')).toBe(false)
  })
  it('Should reinstate application if click on confirm button', async () => {
    component.find('#reinstate_button').hostNodes().simulate('click')
    component.update()
    component.find('#continue').hostNodes().simulate('click')
    component.update()
    const details = await getApplicationsOfCurrentUser()
    const currentUserDrafts = (JSON.parse(details) as IUserData).applications
    expect(currentUserDrafts.length).toBe(1)
  })
})