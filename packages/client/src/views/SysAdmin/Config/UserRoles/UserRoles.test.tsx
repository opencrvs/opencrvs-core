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

import { describe, Mock } from 'vitest'
import { ReactWrapper } from 'enzyme'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { useParams } from 'react-router'
import React from 'react'
import UserRoles from '@client/views/SysAdmin/Config/UserRoles/UserRoles'
import { waitForElement } from '@client/tests/wait-for-element'
import {
  getSystemRolesQuery,
  updateRoleQuery
} from '@client/forms/user/query/queries'

describe('render system role update modal', () => {
  let component: ReactWrapper<{}, {}>

  beforeEach(async () => {
    const { store, history } = createStore()

    component = await createTestComponent(<UserRoles />, {
      store,
      history
    })
    ;(useParams as Mock).mockImplementation(() => ({}))
  })

  it('Render system integrations properly ', async () => {
    expect(component.exists('UserRoles')).toBeTruthy()
  })
})

describe('render update system role', () => {
  let component: ReactWrapper<{}, {}>

  const mocks = [
    {
      request: {
        query: getSystemRolesQuery
      },
      result: {
        data: {
          getSystemRoles: [
            {
              id: '63b3f284452f2e40afa4409d',
              value: 'FIELD_AGENT',
              roles: [
                {
                  _id: '63da2e0e079116030b195d99',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Health Worker',
                      __typename: 'RoleLabel'
                    },
                    {
                      lang: 'fr',
                      label: 'Professionnel de Santé',
                      __typename: 'RoleLabel'
                    }
                  ],
                  __typename: 'Role'
                }
              ],
              __typename: 'SystemRole'
            }
          ]
        }
      }
    },
    {
      request: {
        query: updateRoleQuery,
        variables: {
          systemRole: {
            id: '63b3f284452f2e40afa4409d',
            roles: [
              {
                _id: '63da2e0e079116030b195d99',
                labels: [
                  {
                    lang: 'en',
                    label: 'UP Chairman'
                  },
                  {
                    lang: 'fr',
                    label: 'Professionnel de Santé'
                  }
                ]
              }
            ]
          }
        }
      },
      result: {
        data: {
          updateRole: {
            msg: 'System role updated'
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    const { store, history } = createStore()

    component = await createTestComponent(<UserRoles />, {
      store,
      history,
      graphqlMocks: mocks as any
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
  })

  it('should show the update system model after click the change button', async () => {
    component.find('#changeButton').hostNodes().first().simulate('click')
    expect(component.exists('ResponsiveModal')).toBeTruthy()
  })

  it.skip('should show the update system  role success message after click the confirm button', async () => {
    component.find('#changeButton').hostNodes().last().simulate('click')
    component.update()
    component.find('#editButton').first().simulate('click')

    component
      .find('#roleNameInput')
      .hostNodes()
      .simulate('change', {
        target: {
          name: 'roleNameInput',
          value: 'UP Chairman'
        }
      })
    component.update()
    component.find('#confirm').hostNodes().first().simulate('click')
    component.update()
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    await waitForElement(component, '#updateRoleSuccess')
  })
})
