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
  flushPromises,
  mockDeathApplicationData
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createApplication,
  storeApplication,
  IApplication
} from '@client/applications'
import { Event } from '@client/forms'
import { formatUrl } from '@client/navigation'
import { APPLICATION_RECORD_AUDIT } from '@client/navigation/routes'
import { GQLBirthEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { FETCH_APPLICATION_SHORT_INFO } from './queries'
import { waitForElement } from '@client/tests/wait-for-element'

const declaration: IApplication = createApplication(
  Event.BIRTH,
  mockApplicationData
)
declaration.data.registration = {
  ...declaration.data.registration,
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
    store.dispatch(storeApplication(declaration))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            applicationId: declaration.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              applicationId: declaration.id
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for saved declarations', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe('Draft')
    expect(component.find('#type_value').hostNodes().text()).toBe('Birth')
    expect(component.find('#brn_value').hostNodes().text()).toBe(
      '201908122365BDSS0SE1'
    )
    expect(component.find('#placeOfBirth_value').hostNodes()).toHaveLength(1)
  })
})

describe('Record audit summary for death declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    const deathApplication = createApplication(
      Event.DEATH,
      mockDeathApplicationData
    )

    store.dispatch(storeApplication(deathApplication))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            applicationId: deathApplication.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              applicationId: deathApplication.id
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for saved applications', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe('Draft')
    expect(component.find('#type_value').hostNodes().text()).toBe('Death')
    expect(component.find('#drn_value').hostNodes().text()).toBe(
      '201908122365DDSS0SE1'
    )
    expect(component.find('#placeOfDeath_value').hostNodes()).toHaveLength(1)
  })
})

describe('Record audit summary for WorkQueue declarations', () => {
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
            tab: 'inProgressTab',
            applicationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              applicationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for WQ declarations', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe('Draft')
    expect(component.find('#type_value').hostNodes().text()).toBe('Birth')
    expect(component.find('#content-name').hostNodes().text()).toBe(
      'Shakib Al Hasan'
    )
    expect(component.find('#placeOfBirth_grey').hostNodes()).toHaveLength(1)
    expect(component.find('#placeOfDeath_grey').hostNodes()).toHaveLength(0)
  })
})

describe('Record audit summary for GQLQuery', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    const mocks = [
      {
        request: {
          query: FETCH_APPLICATION_SHORT_INFO,
          variables: {
            id: '956281c9-1f47-4c26-948a-970dd23c4094'
          }
        },
        result: {
          data: {
            fetchRegistration: {
              id: '956281c9-1f47-4c26-948a-970dd23c4094',
              registration: {
                type: 'DEATH',
                trackingId: 'DG6PECX',
                status: [
                  {
                    type: 'REGISTERED'
                  }
                ]
              },
              deceased: {
                name: [
                  {
                    use: 'bn',
                    firstNames: 'ক ম আব্দুল্লাহ আল আমিন ',
                    familyName: 'খান'
                  }
                ]
              }
            }
          }
        }
      }
    ]

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            tab: 'search',
            applicationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'search',
              applicationId: '956281c9-1f47-4c26-948a-970dd23c4094'
            }
          }
        )}
      />,
      { store, history, graphqlMocks: mocks }
    )

    await flushPromises()
    component.update()
  })

  it('Record Audit page loads properly', async () => {
    await waitForElement(component, 'RecordAuditBody')
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for GQL declarations', async () => {
    expect(component.find('#status_value').hostNodes().text()).toBe(
      'Registered'
    )
    expect(component.find('#type_value').hostNodes().text()).toBe('Death')
    expect(component.find('#placeOfBirth_grey').hostNodes()).toHaveLength(0)
    expect(component.find('#placeOfDeath_grey').hostNodes()).toHaveLength(1)
  })
})

describe('Record audit summary for unsuccesful GQLQuery', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    const mocks = [
      {
        request: {
          query: FETCH_APPLICATION_SHORT_INFO,
          variables: {
            id: '956281c9-1f47-4c26-948a-970dd23c4094'
          }
        }
      }
    ]

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(APPLICATION_RECORD_AUDIT, {
            tab: 'search',
            applicationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'search',
              applicationId: '956281c9-1f47-4c26-948a-970dd23c4094'
            }
          }
        )}
      />,
      { store, history, graphqlMocks: mocks }
    )

    await flushPromises()
    component.update()
  })

  it('Redirect to home page', async () => {
    await flushPromises()
    expect(window.location.href).not.toContain('/record-audit')
  })
})
