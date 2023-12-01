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
import { createTestComponent, flushPromises } from '@client/tests/util'
import { AppStore, createStore } from '@client/store'
import { waitFor, waitForElement } from '@client/tests/wait-for-element'
import { USER_AUDIT_ACTION } from '@client/user/queries'
import { GraphQLError } from 'graphql'
import { History } from 'history'
import { vi, Mock } from 'vitest'
import { SystemRoleType, Status } from '@client/utils/gateway'
import { UserDetails } from '@client/utils/userUtils'

const users: UserDetails[] = [
  {
    id: '5d08e102542c7a19fc55b790',
    name: [
      {
        use: 'en',
        firstNames: 'Rabindranath',
        familyName: 'Tagore'
      }
    ],
    username: 'r.tagore',
    systemRole: SystemRoleType.RegistrationAgent,
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Nasreen Pervin',
          familyName: 'Huq'
        }
      ],
      role: SystemRoleType.LocalRegistrar,
      signature: undefined
    },
    role: {
      _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
      labels: [
        {
          lang: 'en',
          label: 'ENTREPENEUR'
        }
      ]
    },
    status: Status.Active,
    creationDate: '2022-10-03T10:42:46.920Z',
    userMgntUserID: '5eba726866458970cf2e23c2',
    practitionerId: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    mobile: '+8801711111111',
    catchmentArea: [
      {
        id: '514cbc3a-cc99-4095-983f-535ea8cb6ac0',
        name: 'Baniajan',
        alias: ['বানিয়াজান'],
        status: 'active',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
            value: 'division=9&district=30&upazila=233&union=4194'
          }
        ]
      }
    ],
    primaryOffice: {
      id: '0d8474da-0361-4d32-979e-af91f012340a',
      name: 'Kaliganj Union Sub Center',
      status: 'active',
      alias: ['Central']
    }
  },
  {
    id: '5d08e102542c7a19fc55b793',
    name: [
      {
        use: 'en',
        firstNames: 'Nasreen Pervin',
        familyName: 'Huq'
      }
    ],
    username: 'np.huq',
    systemRole: SystemRoleType.LocalRegistrar,
    role: {
      _id: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
      labels: [
        {
          lang: 'en',
          label: 'MAYOR'
        }
      ]
    },
    status: Status.Deactivated,
    localRegistrar: {
      name: [
        {
          use: 'en',
          firstNames: 'Kazi Nazrul',
          familyName: 'Islam'
        }
      ],
      role: SystemRoleType.LocalRegistrar,
      signature: undefined
    },
    creationDate: '2022-10-03T10:42:46.920Z',
    userMgntUserID: '5eba726866458970cf2e23c2',
    practitionerId: '778464c0-08f8-4fb7-8a37-b86d1efc462a',
    mobile: '+8801711111111',
    catchmentArea: [
      {
        id: '514cbc3a-cc99-4095-983f-535ea8cb6ac0',
        name: 'Baniajan',
        alias: ['বানিয়াজান'],
        status: 'active',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-reference',
            value: 'division=9&district=30&upazila=233&union=4194'
          }
        ]
      }
    ],
    primaryOffice: {
      id: '0d8474da-0361-4d32-979e-af91f012340a',
      name: 'Kaliganj Union Sub Center',
      status: 'active',
      alias: ['Central']
    }
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
  let history: History
  let onCloseMock: Mock

  beforeEach(async () => {
    ;({ history, store } = await createStore())

    onCloseMock = vi.fn()
  })

  afterEach(() => {
    onCloseMock.mockClear()
  })

  describe('in case of successful deactivate audit action', () => {
    beforeEach(async () => {
      const [successMock] = graphqlMocksOfDeactivate
      const testComponent = await createTestComponent(
        <UserAuditActionModal
          show={true}
          user={users[0]}
          onClose={onCloseMock}
        />,
        { store, history, graphqlMocks: [successMock] }
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
      const [_, errorMock] = graphqlMocksOfDeactivate
      component = await createTestComponent(
        <UserAuditActionModal
          show={true}
          user={users[0]}
          onClose={onCloseMock}
        />,
        { store, history, graphqlMocks: [errorMock] }
      )
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
      const testComponent = await createTestComponent(
        <UserAuditActionModal
          show={true}
          user={users[1]}
          onClose={onCloseMock}
        />,
        { store, history, graphqlMocks: [successMock] }
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
      const [_, errorMock] = graphqlMocksOfReactivate
      component = await createTestComponent(
        <UserAuditActionModal
          show={true}
          user={users[1]}
          onClose={onCloseMock}
        />,
        { store, history, graphqlMocks: [errorMock] }
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
