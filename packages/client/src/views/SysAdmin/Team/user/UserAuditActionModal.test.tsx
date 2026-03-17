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
import { ReactWrapper } from 'enzyme'
import { UserAuditActionModal, AUDIT_ACTION } from './UserAuditActionModal'
import { createTestComponent } from '@client/tests/util'
import { AppStore, createStore } from '@client/store'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { USER_AUDIT_ACTION } from '@client/user/queries'
import { GraphQLError } from 'graphql'
import { vi } from 'vitest'
import { User, UUID } from '@opencrvs/commons/client'
import { useUsers } from '@client/v2-events/hooks/useUsers'

vi.mock('@client/v2-events/hooks/useUsers')

const users: User[] = [
  {
    type: 'user',
    id: '5d08e102542c7a19fc55b790',
    name: [
      {
        use: 'en',
        given: ['Rabindranath'],
        family: 'Tagore'
      }
    ],
    role: 'ENTREPRENEUR',
    primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a' as UUID,
    mobile: '+8801711111111',
    status: 'active'
  },
  {
    type: 'user',
    id: '5d08e102542c7a19fc55b793',
    name: [
      {
        use: 'en',
        given: ['Nasreen Pervin'],
        family: 'Huq'
      }
    ],
    role: 'MAYOR',
    primaryOfficeId: '0d8474da-0361-4d32-979e-af91f012340a' as UUID,
    mobile: '+8801711111111',
    status: 'deactivated'
  }
]

const graphqlMocksOfDeactivate = [
  {
    request: {
      query: USER_AUDIT_ACTION,
      variables: {
        userId: '5d08e102542c7a19fc55b790',
        action: AUDIT_ACTION.DEACTIVATE,
        reason: 'TERMINATED',
        comment: ''
      }
    },
    result: {
      data: {
        auditUser: true
      }
    }
  },
  {
    request: {
      query: USER_AUDIT_ACTION,
      variables: {
        userId: '5d08e102542c7a19fc55b790',
        action: AUDIT_ACTION.DEACTIVATE,
        reason: 'TERMINATED',
        comment: ''
      }
    },
    result: {
      errors: [new GraphQLError('Error!')]
    }
  }
]

const graphqlMocksOfReactivate = [
  {
    request: {
      query: USER_AUDIT_ACTION,
      variables: {
        userId: '5d08e102542c7a19fc55b793',
        action: AUDIT_ACTION.REACTIVATE,
        reason: 'ROLE_REGAINED',
        comment: ''
      }
    },
    result: {
      data: {
        auditUser: true
      }
    }
  },
  {
    request: {
      query: USER_AUDIT_ACTION,
      variables: {
        userId: '5d08e102542c7a19fc55b793',
        action: AUDIT_ACTION.DEACTIVATE,
        reason: 'ROLE_REGAINED',
        comment: ''
      }
    },
    result: {
      errors: [new GraphQLError('Error!')]
    }
  }
]

describe('user audit action modal tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  const onCloseMock = vi.fn()

  beforeEach(async () => {
    ;({ store } = await createStore())
  })

  afterEach(() => {
    onCloseMock.mockClear()
  })

  describe('in case of successful deactivate audit action', () => {
    beforeEach(async () => {
      const [successMock] = graphqlMocksOfDeactivate

      vi.mocked(useUsers).mockImplementation(
        () =>
          ({
            getUser: {
              useQuery: () => ({
                data: users[0],
                isFetching: false,
                error: null
              })
            }
          }) as unknown as ReturnType<typeof useUsers>
      )

      const { component: testComponent } = await createTestComponent(
        <UserAuditActionModal
          show={true}
          userId={users[0].id}
          onClose={onCloseMock}
        />,
        { store, graphqlMocks: [successMock] }
      )
      component = testComponent
    })

    it('renders responsive modal', async () => {
      await waitForElement(component, '#user-audit-modal')
    })

    it('renders title for deactivation', async () => {
      const title = await waitForElement(component, '#user-audit-modal h1')
      expect(title.text()).toBe('Deactivate Rabindranath Tagore?')
    })

    it('renders subtitle for deactivation', async () => {
      const subtitle = await waitForElement(component, '#modal-subtitle')
      expect(subtitle.hostNodes().text()).toBe(
        'This will revoke Rabindranath Tagore’s ability to login and access the system. The account can be reactivated at a later date.'
      )
    })

    it('clicking on confirm action with empty form shows error text', async () => {
      const confirmButton = await waitForElement(
        component,
        '#deactivate-action'
      )
      confirmButton.hostNodes().simulate('click')
      await waitForElement(component, '#form-error')
    })

    describe('after filling mandatory data', () => {
      beforeEach(async () => {
        const terminatedRadioOption = await waitForElement(
          component,
          '#reason_TERMINATED'
        )
        terminatedRadioOption.hostNodes().simulate('change')
      })

      it('clicking confirm action dispatches success notification action', async () => {
        const confirmButton = await waitForElement(
          component,
          '#deactivate-action'
        )
        confirmButton.hostNodes().simulate('click')
        waitFor(
          () =>
            store.getState().notification.userAuditSuccessToast.visible === true
        )
      })
    })
  })

  describe('in case of failed deactivate audit action', () => {
    beforeEach(async () => {
      const [, errorMock] = graphqlMocksOfDeactivate

      vi.mocked(useUsers).mockImplementation(
        () =>
          ({
            getUser: {
              useQuery: () => ({
                data: users[0],
                isFetching: false,
                error: null
              })
            }
          }) as unknown as ReturnType<typeof useUsers>
      )

      const { component: testComponent } = await createTestComponent(
        <UserAuditActionModal
          show={true}
          userId={users[0].id}
          onClose={onCloseMock}
        />,
        { store, graphqlMocks: [errorMock] }
      )
      component = testComponent
    })

    describe('after filling mandatory data', () => {
      beforeEach(async () => {
        const terminatedRadioOption = await waitForElement(
          component,
          '#reason_TERMINATED'
        )
        terminatedRadioOption.hostNodes().simulate('change')
      })

      it('clicking confirm action dispatches error notification action', async () => {
        component.find('#deactivate-action').hostNodes().simulate('click')
        waitFor(
          () =>
            store.getState().notification.submitFormErrorToast ===
            'userFormFail'
        )
      })
    })
  })

  describe('in case of successful reactivate audit action', () => {
    beforeEach(async () => {
      const [successMock] = graphqlMocksOfReactivate

      vi.mocked(useUsers).mockImplementation(
        () =>
          ({
            getUser: {
              useQuery: () => ({
                data: users[1],
                isFetching: false,
                error: null
              })
            }
          }) as unknown as ReturnType<typeof useUsers>
      )

      const { component: testComponent } = await createTestComponent(
        <UserAuditActionModal
          show={true}
          userId={users[1].id}
          onClose={onCloseMock}
        />,
        { store, graphqlMocks: [successMock] }
      )
      component = testComponent
    })

    it('renders title for reactivation', async () => {
      const title = await waitForElement(component, '#user-audit-modal h1')
      expect(title.text()).toBe('Reactivate Nasreen Pervin Huq?')
    })

    it('renders subtitle for reactivation', async () => {
      const subtitle = await waitForElement(component, '#modal-subtitle')
      expect(subtitle.hostNodes().text()).toBe(
        'This will reactivate Nasreen Pervin Huq’s ability to login and access the system.'
      )
    })

    describe('after filling mandatory data', () => {
      beforeEach(async () => {
        const roleRegainedRadioOption = await waitForElement(
          component,
          '#reason_ROLE_REGAINED'
        )
        roleRegainedRadioOption.hostNodes().simulate('change')
      })

      it('clicking confirm action dispatches success notification action', async () => {
        const confirmButton = await waitForElement(
          component,
          '#reactivate-action'
        )
        confirmButton.hostNodes().simulate('click')

        waitFor(
          () => store.getState().notification.userAuditSuccessToast.visible
        )
      })
    })
  })

  describe('in case of failed reactivate audit action', () => {
    beforeEach(async () => {
      const [, errorMock] = graphqlMocksOfReactivate

      vi.mocked(useUsers).mockImplementation(
        () =>
          ({
            getUser: {
              useQuery: () => ({
                data: users[1],
                isFetching: false,
                error: null
              })
            }
          }) as unknown as ReturnType<typeof useUsers>
      )

      const { component: testComponent } = await createTestComponent(
        <UserAuditActionModal
          show={true}
          userId={users[1].id}
          onClose={onCloseMock}
        />,
        { store, graphqlMocks: [errorMock] }
      )
      component = testComponent
    })

    describe('after filling mandatory data', () => {
      beforeEach(async () => {
        const roleRegainedRadioOption = await waitForElement(
          component,
          '#reason_ROLE_REGAINED'
        )
        roleRegainedRadioOption.hostNodes().simulate('change')
      })

      it('clicking confirm action dispatches error notification action', async () => {
        const confirmButton = await waitForElement(
          component,
          '#reactivate-action'
        )
        confirmButton.hostNodes().simulate('click')

        waitFor(
          () =>
            store.getState().notification.submitFormErrorToast ===
            'userFormFail'
        )
      })
    })
  })
})
