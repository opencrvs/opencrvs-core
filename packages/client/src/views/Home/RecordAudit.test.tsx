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
  flushPromises
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createApplication,
  storeApplication,
  IApplication,
  modifyApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { formatUrl } from '@client/navigation'
import { APPLICATION_RECORD_AUDIT } from '@client/navigation/routes'
import { GQLBirthEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { checkAuth } from '@client/profile/profileActions'
const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock
const mockFetchUserDetails = jest.fn()

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

describe('Record audit reinstated button', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth({ '?token': registerScopeToken }))
    store.dispatch(storeApplication(application))
    application.registrationStatus = 'ARCHIVED'
    application.submissionStatus = 'ARCHIVED'
    store.dispatch(modifyApplication(application))
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
})
