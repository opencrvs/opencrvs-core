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

import { Navigation } from '@client/components/interface/Navigation'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { queries } from '@client/profile/queries'
import { storage } from '@client/storage'
import { createStore } from '@client/store'
import {
  createTestComponent,
  flushPromises,
  mockUserResponse,
  REGISTRATION_AGENT_DEFAULT_SCOPES,
  setScopes,
  SYSTEM_ADMIN_DEFAULT_SCOPES
} from '@client/tests/util'
import { createClient } from '@client/utils/apolloClient'
import { OfficeHome } from '@client/views/OfficeHome/OfficeHome'
import { ReactWrapper } from 'enzyme'
import { merge } from 'lodash'
import * as React from 'react'
import { scopes as allScopes, Scope, SCOPES } from '@opencrvs/commons/client'
import { vi } from 'vitest'
import { createMemoryRouter } from 'react-router-dom'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'

const mockFetchUserDetails = vi.fn()

const nameObj = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ]
    }
  }
}

const nameObjNatlSysAdmin = {
  data: {
    getUser: {
      name: [
        {
          use: 'en',
          firstNames: 'Mohammad',
          familyName: 'Ashraful',
          __typename: 'HumanName'
        },
        { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
      ]
    }
  }
}

storage.getItem = vi.fn()
storage.setItem = vi.fn()

let { store } = createStore()
let client = createClient(store)

describe('Navigation for national system admin related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObjNatlSysAdmin)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)

    setScopes(SYSTEM_ADMIN_DEFAULT_SCOPES, store)
    await flushPromises()

    const { component } = await createTestComponent(<OfficeHome />, { store })

    testComponent = component
  })

  it('Tabs loaded successfully including config tab', async () => {
    expect(testComponent.exists('#navigation_team')).toBeTruthy()
    expect(testComponent.exists('#navigation_config_main')).toBeTruthy()
    testComponent.find('#navigation_config_main').hostNodes().simulate('click')
    testComponent.update()
  })

  it('No application related tabs', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeFalsy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeFalsy()
    expect(testComponent.exists('#navigation_print')).toBeFalsy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeFalsy()
  })
})

describe('Navigation for Registration agent related tests', () => {
  let testComponent: ReactWrapper<{}, {}>
  let router: ReturnType<typeof createMemoryRouter>
  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)

    setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)

    await flushPromises()

    const { component, router: testRouter } = await createTestComponent(
      <OfficeHome />,
      { store }
    )
    router = testRouter
    testComponent = component
  })
  it('renders page with team and performance tab for registration agent', async () => {
    const { component } = await createTestComponent(<OfficeHome />, {
      store,
      apolloClient: client
    })
    expect(component.exists('#navigation_team')).toBeTruthy()
    expect(component.exists('#navigation_performance')).toBeTruthy()
    expect(component.exists('#navigation_config_main')).toBeFalsy()
  })

  it('5 application tabs exists for registration agent', async () => {
    expect(testComponent.exists('#navigation_progress')).toBeTruthy()
    expect(testComponent.exists('#navigation_sentForReview')).toBeFalsy()
    expect(testComponent.exists('#navigation_readyForReview')).toBeTruthy()
    expect(testComponent.exists('#navigation_requiresUpdate')).toBeTruthy()
    expect(testComponent.exists('#navigation_print')).toBeTruthy()
    expect(testComponent.exists('#navigation_waitingValidation')).toBeFalsy()
    expect(testComponent.exists('#navigation_approvals')).toBeTruthy()
  })

  it('redirects when tabs are clicked', async () => {
    testComponent
      .find('#navigation_readyForReview')
      .hostNodes()
      .simulate('click')
    await flushPromises()

    expect(router.state.location.pathname).toContain('readyForReview')

    testComponent
      .find('#navigation_requiresUpdate')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(router.state.location.pathname).toContain('requiresUpdate')

    testComponent.find('#navigation_approvals').hostNodes().simulate('click')
    await flushPromises()
    expect(router.state.location.pathname).toContain('approvals')
  })
})

describe('Navigation for District Registrar related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store } = createStore())
    client = createClient(store)

    const { component } = await createTestComponent(
      <Navigation menuCollapse={() => {}} />,
      { store }
    )

    testComponent = component
  })
  it('settings and logout exists on navigation mobile view', async () => {
    expect(testComponent.exists('#navigation_settings')).toBeTruthy()
    expect(testComponent.exists('#navigation_logout')).toBeTruthy()
  })
})

describe('Given a user with scopes views Navigation', () => {
  let testComponent: ReactWrapper<{}, {}>
  let build: () => Promise<ReactWrapper<{}, {}>>

  beforeEach(async () => {
    ;({ store } = createStore())
    client = createClient(store)

    build = async () =>
      (
        await createTestComponent(<OfficeHome />, {
          store,
          initialEntries: [
            formatUrl(REGISTRAR_HOME_TAB, {
              tabId: WORKQUEUE_TABS.inProgress
            })
          ],
          path: REGISTRAR_HOME_TAB
        })
      )?.component
  })
  describe('My drafts', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.myDrafts}`

    const requiredScopes = [
      SCOPES.RECORD_DECLARE_BIRTH,
      SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION,
      SCOPES.RECORD_DECLARE_DEATH,
      SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION,
      SCOPES.RECORD_DECLARE_MARRIAGE,
      SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [[requiredScopes[0]], true],
      [[requiredScopes[1]], true],
      [[requiredScopes[2]], true],
      [[requiredScopes[3]], true],
      [[requiredScopes[4]], true],
      [[requiredScopes[5]], true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('In progress', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.inProgress}`

    const requiredScopes = [
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REGISTER
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [[requiredScopes[0]], true],
      [[requiredScopes[1]], true],
      [[requiredScopes[2]], true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Sent for review', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.sentForReview}`

    const requiredScopes = [SCOPES.RECORD_SUBMIT_FOR_REVIEW] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Sent for approval', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.sentForApproval}`

    const requiredScopes = [
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Requires update', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.requiresUpdate}`

    const requiredScopes = [SCOPES.RECORD_SUBMIT_FOR_UPDATES] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Ready for review', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.readyForReview}`

    const requiredScopes = [
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REGISTER
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Ready to print', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.readyToPrint}`

    const requiredScopes = [
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('External validation', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.externalValidation}`

    const requiredScopes = [SCOPES.RECORD_REGISTER] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes} EXTERNAL_VALIDATION_WORKQUEUE is true in config`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE).toBe(true)
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Ready to issue', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.readyToIssue}`

    const requiredScopes = [
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes} and PRINT_IN_ADVANCE is true in config`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(
          store.getState().offline.offlineData.config?.BIRTH.PRINT_IN_ADVANCE
        ).toBeTruthy()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Outbox', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.outbox}`

    const requiredScopes = [
      SCOPES.RECORD_SUBMIT_INCOMPLETE,
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_REVIEW_DUPLICATES,
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
      SCOPES.RECORD_REGISTRATION_CORRECT,
      SCOPES.RECORD_DECLARATION_ARCHIVE,
      SCOPES.RECORD_DECLARATION_REINSTATE
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )
    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Organisation', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.organisation}`

    const requiredScopes = [
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Team', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.team}`

    const requiredScopes = [
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Config', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.config}_main`

    const requiredScopes = [SCOPES.CONFIG_UPDATE_ALL] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Systems', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.systems}`

    const requiredScopes = [SCOPES.CONFIG_UPDATE_ALL] as Scope[]

    const tests = [[requiredScopes, true]]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes} and clicks config expander`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        testComponent
          .find(`#navigation_${WORKQUEUE_TABS.config}_main`)
          .hostNodes()
          .simulate('click')

        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Communications', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.communications}_main`

    const requiredScopes = [SCOPES.CONFIG_UPDATE_ALL] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Email all users', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.emailAllUsers}`

    const requiredScopes = [SCOPES.CONFIG_UPDATE_ALL] as Scope[]

    const tests = [[requiredScopes, true]]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes} and clicks communciation expander`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        testComponent
          .find(`#navigation_${WORKQUEUE_TABS.communications}_main`)
          .hostNodes()
          .simulate('click')

        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Dashboard', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.dashboard}`

    const requiredScopes = [SCOPES.PERFORMANCE_READ_DASHBOARDS] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Performance', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.performance}`

    const requiredScopes = [SCOPES.PERFORMANCE_READ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Statistics', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.statistics}`

    const requiredScopes = [SCOPES.PERFORMANCE_READ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Statistics', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.statistics}`

    const requiredScopes = [SCOPES.PERFORMANCE_READ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Statistics', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.leaderboards}`

    const requiredScopes = [SCOPES.PERFORMANCE_READ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('Exports', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.vsexports}`

    const requiredScopes = [
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
    ] as Scope[]

    const allOtherScopes = allScopes.filter(
      (scope) => !requiredScopes.includes(scope)
    )

    const tests = [
      [requiredScopes, true],
      [allOtherScopes, false]
    ]

    tests.forEach(async ([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })
})
