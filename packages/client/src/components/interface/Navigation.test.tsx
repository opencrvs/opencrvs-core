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

import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
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
import { vi } from 'vitest'
import { scopes as allScopes, Scope } from '@client/utils/gateway'

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
      ],
      systemRole: 'REGISTRATION_AGENT'
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
      ],
      systemRole: 'NATIONAL_SYSTEM_ADMIN'
    }
  }
}

storage.getItem = vi.fn()
storage.setItem = vi.fn()

let { store, history } = createStore()
let client = createClient(store)

describe('Navigation for national system admin related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObjNatlSysAdmin)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)

    setScopes(SYSTEM_ADMIN_DEFAULT_SCOPES, store)
    await flushPromises()

    testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: {
            tabId: WORKQUEUE_TABS.inProgress
          },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history }
    )
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

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)

    setScopes(REGISTRATION_AGENT_DEFAULT_SCOPES, store)

    await flushPromises()

    testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: {
            tabId: WORKQUEUE_TABS.inProgress
          },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history }
    )
  })
  it('renders page with team and performance tab for registration agent', async () => {
    const testComponent = await createTestComponent(
      <OfficeHome
        match={{
          params: { tabId: WORKQUEUE_TABS.inProgress },
          isExact: true,
          path: '',
          url: ''
        }}
        staticContext={undefined}
        history={history}
        location={history.location}
      />,
      { store, history, apolloClient: client }
    )
    expect(testComponent.exists('#navigation_team')).toBeTruthy()
    expect(testComponent.exists('#navigation_performance')).toBeTruthy()
    expect(testComponent.exists('#navigation_config_main')).toBeFalsy()
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
    expect(window.location.href).toContain('readyForReview')

    testComponent
      .find('#navigation_requiresUpdate')
      .hostNodes()
      .simulate('click')
    await flushPromises()
    expect(window.location.href).toContain('requiresUpdate')

    testComponent.find('#navigation_approvals').hostNodes().simulate('click')
    await flushPromises()
    expect(window.location.href).toContain('approvals')
  })
})

describe('Navigation for District Registrar related tests', () => {
  let testComponent: ReactWrapper<{}, {}>

  beforeEach(async () => {
    merge(mockUserResponse, nameObj)
    mockFetchUserDetails.mockReturnValue(mockUserResponse)
    queries.fetchUserDetails = mockFetchUserDetails
    ;({ store, history } = createStore())
    client = createClient(store)

    testComponent = await createTestComponent(
      <Navigation menuCollapse={() => {}} />,
      { store, history }
    )
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
    ;({ store, history } = createStore())
    client = createClient(store)

    build = async () =>
      await createTestComponent(
        <OfficeHome
          match={{
            params: {
              tabId: WORKQUEUE_TABS.systems
            },
            isExact: true,
            path: '',
            url: ''
          }}
          history={history}
          location={history.location}
        />,
        { store, history }
      )
  })

  describe('In progress', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.inProgress}`

    const requiredScopes = [
      'record.declare-birth',
      'record.declare-birth:my-jurisdiction',
      'record.declare-death',
      'record.declare-death:my-jurisdiction',
      'record.declare-marriage',
      'record.declare-marriage:my-jurisdiction'
    ]

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

  describe('Sent for review', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.sentForReview}`

    const requiredScopes = ['record.submit-for-review']

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

    const requiredScopes = ['record.submit-for-approval']

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

    const requiredScopes = ['record.declaration-review']

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

    const requiredScopes = ['record.declaration-review']

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

    const requiredScopes = ['record.print-issue-certified-copies']

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

    const requiredScopes = ['record.register']

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

    const requiredScopes = ['record.print-issue-certified-copies']

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

    const excludedScopes = ['sysadmin', 'natlsysadmin']

    const anyOtherScope = allScopes.filter(
      (scope) => !excludedScopes.includes(scope)
    )
    const tests = [
      [[excludedScopes[0]], false],
      [[excludedScopes[1]], false],
      [anyOtherScope, true]
    ]

    tests.forEach(([scopes, exists]) => {
      it(`should render when user has correct scopes ${scopes}`, async () => {
        setScopes(scopes as Scope[], store)
        testComponent = await build()
        expect(testComponent.exists(id)).toBe(exists)
      })
    })
  })

  describe('and user has organisation scopes', async () => {
    const orgScopes = [
      'organisation.read',
      'organisation.read-locations',
      'organisation.read-locations:my-office'
    ]

    describe('Performance', async () => {
      const id = `#navigation_${WORKQUEUE_TABS.performance}`

      const requiredScopes = ['performance.read'].concat(orgScopes)

      const allOtherScopes = allScopes.filter(
        (scope) => !requiredScopes.includes(scope)
      )

      const withoutOrgScopes = allScopes.filter(
        (scope) => !orgScopes.includes(scope)
      )

      const tests = [
        [requiredScopes, true],
        [allOtherScopes, false],
        [withoutOrgScopes, false]
      ]

      tests.forEach(async ([scopes, exists]) => {
        it(`should render when user has correct scopes ${scopes}`, async () => {
          setScopes(scopes as Scope[], store)
          testComponent = await build()
          expect(testComponent.exists(id)).toBe(exists)
        })
      })
    })

    describe('Organisation', async () => {
      const id = `#navigation_${WORKQUEUE_TABS.organisation}`

      const requiredScopes = ['organisation.read']

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
        'organisation.read-locations',
        'organisation.read-locations:my-office'
      ]

      const allOtherScopes = allScopes.filter(
        (scope) => !requiredScopes.includes(scope)
      )

      const tests = [
        [[requiredScopes[0]], true],
        [[requiredScopes[1]], true],
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

      const requiredScopes = ['sysadmin', 'natlsysadmin']

      const allOtherScopes = allScopes.filter(
        (scope) => !requiredScopes.includes(scope)
      )

      const tests = [
        [[requiredScopes[0], orgScopes[0]], true],
        [[requiredScopes[0], orgScopes[1]], true],
        [[requiredScopes[0], orgScopes[2]], true],
        [[requiredScopes[1], orgScopes[0]], true],
        [[requiredScopes[1], orgScopes[1]], true],
        [[requiredScopes[1], orgScopes[2]], true],
        [requiredScopes, false],
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

      const requiredScopes = ['sysadmin', 'natlsysadmin'].concat(orgScopes)

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

      const requiredScopes = ['sysadmin', 'natlsysadmin']

      const allOtherScopes = allScopes.filter(
        (scope) => !requiredScopes.includes(scope)
      )

      const tests = [
        [[requiredScopes[0], orgScopes[0]], true],
        [[requiredScopes[0], orgScopes[1]], true],
        [[requiredScopes[0], orgScopes[2]], true],
        [[requiredScopes[1], orgScopes[0]], true],
        [[requiredScopes[1], orgScopes[1]], true],
        [[requiredScopes[1], orgScopes[2]], true],
        [requiredScopes, false],
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

      const requiredScopes = ['sysadmin', 'natlsysadmin'].concat(orgScopes)

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
  })

  describe('Dashboard', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.dashboard}`

    const requiredScopes = ['performance.read-dashboards']

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

    const requiredScopes = ['performance.read']

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

    const requiredScopes = ['performance.read']

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

    const requiredScopes = ['performance.read']

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

  describe('Report', async () => {
    const id = `#navigation_${WORKQUEUE_TABS.report}`

    const requiredScopes = ['performance.read']

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

    const requiredScopes = ['performance.export-vital-statistics']

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
