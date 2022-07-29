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
  mockDeclarationData,
  createRouterProps,
  registerScopeToken,
  getItem,
  flushPromises,
  mockDeathDeclarationData,
  userDetails
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createDeclaration,
  storeDeclaration,
  IDeclaration,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS,
  IWorkqueue,
  getCurrentUserWorkqueuSuccess
} from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import { DECLARATION_RECORD_AUDIT } from '@client/navigation/routes'
import { GQLBirthEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { checkAuth } from '@client/profile/profileActions'
import { FETCH_DECLARATION_SHORT_INFO } from './queries'
import { waitForElement } from '@client/tests/wait-for-element'

const declaration: IDeclaration = createDeclaration(
  Event.Birth,
  mockDeclarationData
)
declaration.data.registration = {
  ...declaration.data.registration,
  informantType: 'MOTHER',
  contactPoint: {
    value: 'MOTHER',
    nestedFields: { registrationPhone: '01557394986' }
  }
}

// @ts-ignore
declaration.data.history = [
  {
    date: new Date().toString(),
    action: 'CREATED',
    user: {
      id: userDetails.userMgntUserID,
      name: userDetails.name,
      role: userDetails.role
    },
    office: userDetails.primaryOffice,
    comments: [],
    input: [],
    output: []
  }
]

const workqueue: IWorkqueue = {
  data: {
    inProgressTab: {},
    notificationTab: {},
    reviewTab: {
      results: [
        {
          id: declaration.id,
          registration: {
            assignment: {
              userId: '123',
              firstName: 'Kennedy',
              lastName: 'Mweene'
            }
          }
        }
      ],
      totalItems: 1
    },
    rejectTab: {},
    approvalTab: {},
    printTab: {},
    externalValidationTab: {}
  },
  initialSyncDone: true
}

describe('Record audit summary for a draft birth declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    store.dispatch(storeDeclaration(declaration))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: declaration.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              declarationId: declaration.id
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
    expect(component.exists('#brn_value')).toBeFalsy()
    expect(component.find('#placeOfBirth_value').hostNodes()).toHaveLength(1)
  })
})

describe('Record audit summary for a draft death declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()
    const deathDeclaration = createDeclaration(
      Event.Death,
      mockDeathDeclarationData
    )

    store.dispatch(storeDeclaration(deathDeclaration))
    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: deathDeclaration.id
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              declarationId: deathDeclaration.id
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
    expect(component.find('#type_value').hostNodes().text()).toBe('Death')
    expect(component.exists('#drn_value')).toBeFalsy()
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
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'inProgressTab',
              declarationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
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

describe('Record audit for a draft declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    getItem.mockReturnValue(registerScopeToken)

    store.dispatch(checkAuth())

    await flushPromises()

    declaration.submissionStatus = SUBMISSION_STATUS.DECLARED
    declaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADED

    store.dispatch(storeDeclaration(declaration))
    store.dispatch(getCurrentUserWorkqueuSuccess(JSON.stringify(workqueue)))

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(DECLARATION_RECORD_AUDIT, {
            declarationId: declaration.id,
            tab: 'reviewTab'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              declarationId: declaration.id,
              tab: 'reviewTab'
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

describe('Record audit summary for GQLQuery', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    const mocks = [
      {
        request: {
          query: FETCH_DECLARATION_SHORT_INFO,
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
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'search',
            declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'search',
              declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
            }
          }
        )}
      />,
      { store, history, graphqlMocks: mocks }
    )

    await flushPromises()
    component.update()
    await waitForElement(component, 'RecordAuditBody')
  })

  it('Record Audit page loads properly', async () => {
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
          query: FETCH_DECLARATION_SHORT_INFO,
          variables: {
            id: '956281c9-1f47-4c26-948a-970dd23c4094'
          }
        }
      }
    ]

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'search',
            declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              tab: 'search',
              declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
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
    expect(window.location.href).not.toContain('/record-audit')
  })
})

describe('Record audit for a reinstate declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    getItem.mockReturnValue(registerScopeToken)

    store.dispatch(checkAuth())

    await flushPromises()

    declaration.submissionStatus = SUBMISSION_STATUS.ARCHIVED
    declaration.downloadStatus = DOWNLOAD_STATUS.DOWNLOADED
    store.dispatch(storeDeclaration(declaration))
    store.dispatch(getCurrentUserWorkqueuSuccess(JSON.stringify(workqueue)))

    component = await createTestComponent(
      <RecordAudit
        {...createRouterProps(
          formatUrl(DECLARATION_RECORD_AUDIT, {
            declarationId: declaration.id,
            tab: 'reviewTab'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              declarationId: declaration.id,
              tab: 'reviewTab'
            }
          }
        )}
      />,
      { store, history }
    )
  })

  it('should show the reinstate button', async () => {
    expect(component.exists('#reinstate_button')).toBeTruthy()
  })

  it('should show the confirmation modal when reinstate button is clicked', async () => {
    component.find('#reinstate_button').hostNodes().simulate('click')
    component.update()
    expect(component.find('ResponsiveModal').prop('show')).toBeTruthy()
  })

  it('should close the confirmation modal when cancel button is clicked', async () => {
    component.find('#reinstate_button').hostNodes().simulate('click')
    component.update()
    component.find('#cancel-btn').hostNodes().simulate('click')
    component.update()
    expect(component.find('ResponsiveModal').prop('show')).toBe(false)
  })
})
