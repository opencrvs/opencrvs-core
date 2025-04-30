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

import * as React from 'react'
import {
  createTestComponent,
  mockDeclarationData,
  flushPromises,
  mockDeathDeclarationData,
  mockMarriageDeclarationData,
  userDetails
} from '@client/tests/util'
import { RecordAudit } from './RecordAudit'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  createDeclaration,
  storeDeclaration,
  IDeclaration
} from '@client/declarations'
import { EventType } from '@client/utils/gateway'
import { formatUrl } from '@client/navigation'
import { DECLARATION_RECORD_AUDIT } from '@client/navigation/routes'
import type { GQLBirthEventSearchSet } from '@client/utils/gateway-deprecated-do-not-use'
import { FETCH_DECLARATION_SHORT_INFO } from './queries'
import { waitForElement } from '@client/tests/wait-for-element'

const declaration: IDeclaration = createDeclaration(
  EventType.Birth,
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

declaration.data.history = [
  // @ts-ignore
  {
    date: new Date().toString(),
    regStatus: 'STARTED',
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

describe('Record audit summary for a draft birth declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    store.dispatch(storeDeclaration(declaration))
    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        path: DECLARATION_RECORD_AUDIT,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: declaration.id
          })
        ]
      }
    )
    component = testComponent
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for saved declarations', async () => {
    expect(
      component.find({ 'data-testid': 'status-value' }).hostNodes().text()
    ).toBe('Draft')
    expect(
      component.find({ 'data-testid': 'type-value' }).hostNodes().text()
    ).toBe('Birth')
    expect(component.exists({ 'data-testid': 'brn-value' })).toBeFalsy()
    expect(
      component.find({ 'data-testid': 'placeOfBirth-value' }).hostNodes()
    ).toHaveLength(1)
  })
})

describe('Record audit summary for a draft death declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const deathDeclaration = createDeclaration(
      EventType.Death,
      mockDeathDeclarationData
    )

    store.dispatch(storeDeclaration(deathDeclaration))
    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: deathDeclaration.id
          })
        ],
        path: DECLARATION_RECORD_AUDIT
      }
    )
    component = testComponent
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for saved declarations', async () => {
    expect(
      component.find({ 'data-testid': 'status-value' }).hostNodes().text()
    ).toBe('Draft')
    expect(
      component.find({ 'data-testid': 'type-value' }).hostNodes().text()
    ).toBe('Death')
    expect(component.exists({ 'data-testid': 'drn-value' })).toBeFalsy()
    expect(
      component.find({ 'data-testid': 'placeOfDeath-value' }).hostNodes()
    ).toHaveLength(1)
  })
})

describe('Record audit summary for a draft marriage declaration', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()
    const marriageDeclaration = createDeclaration(
      EventType.Marriage,
      mockMarriageDeclarationData
    )

    store.dispatch(storeDeclaration(marriageDeclaration))
    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        path: DECLARATION_RECORD_AUDIT,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: marriageDeclaration.id
          })
        ]
      }
    )
    component = testComponent
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for saved declarations', async () => {
    expect(
      component.find({ 'data-testid': 'status-value' }).hostNodes().text()
    ).toBe('Draft')
    expect(
      component.find({ 'data-testid': 'type-value' }).hostNodes().text()
    ).toBe('Marriage')
    expect(component.exists({ 'data-testid': 'drn-value' })).toBeFalsy()
    expect(
      component.find({ 'data-testid': 'placeOfMarriage-value' }).hostNodes()
    ).toHaveLength(1)
  })
})

describe('Record audit summary for WorkQueue declarations', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

    store.getState().workqueueState.workqueue.data.inProgressTab.results = [
      {
        id: 'db097901-feba-4f71-a1ae-d3d46289d2d5',
        type: EventType.Birth,
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

    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        path: DECLARATION_RECORD_AUDIT,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'inProgressTab',
            declarationId: 'db097901-feba-4f71-a1ae-d3d46289d2d5'
          })
        ]
      }
    )
    component = testComponent
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for WQ declarations', async () => {
    expect(
      component.find({ 'data-testid': 'status-value' }).hostNodes().text()
    ).toBe('Draft')
    expect(
      component.find({ 'data-testid': 'type-value' }).hostNodes().text()
    ).toBe('Birth')
    expect(component.find('#content-name').hostNodes().text()).toBe(
      'Al Hasan Shakib'
    )
    expect(
      component
        .find({
          'data-testid': 'placeOfBirth-value',
          'data-testclass': 'locked'
        })
        .hostNodes()
    ).toHaveLength(1)
    expect(
      component
        .find({
          'data-testid': 'placeOfDeath-value',
          'data-testclass': 'locked'
        })
        .hostNodes()
    ).toHaveLength(0)
  })
})

describe('Record audit summary for GQLQuery', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

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

    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        path: DECLARATION_RECORD_AUDIT,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'search',
            declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          })
        ],
        graphqlMocks: mocks
      }
    )
    component = testComponent

    await flushPromises()
    component.update()
    await waitForElement(component, 'RecordAuditBody')
  })

  it('Record Audit page loads properly', async () => {
    expect(component.exists('RecordAuditBody')).toBeTruthy()
  })

  it('Check values for GQL declarations', async () => {
    expect(
      component.find({ 'data-testid': 'status-value' }).hostNodes().text()
    ).toBe('Registered')
    expect(
      component.find({ 'data-testid': 'type-value' }).hostNodes().text()
    ).toBe('Death')
    expect(
      component
        .find({
          'data-testid': 'placeOfBirth-value',
          'data-testclass': 'locked'
        })
        .hostNodes()
    ).toHaveLength(0)
    expect(
      component
        .find({
          'data-testid': 'placeOfDeath-value',
          'data-testclass': 'locked'
        })
        .hostNodes()
    ).toHaveLength(1)
  })
})

describe('Record audit summary for unsuccesful GQLQuery', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store } = createStore()

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

    const { component: testComponent } = await createTestComponent(
      <RecordAudit />,
      {
        store,
        path: DECLARATION_RECORD_AUDIT,
        initialEntries: [
          formatUrl(DECLARATION_RECORD_AUDIT, {
            tab: 'search',
            declarationId: '956281c9-1f47-4c26-948a-970dd23c4094'
          })
        ],
        graphqlMocks: mocks
      }
    )
    component = testComponent

    await flushPromises()
    component.update()
  })

  it('Redirect to home page', async () => {
    expect(window.location.href).not.toContain('/record-audit')
  })
})
