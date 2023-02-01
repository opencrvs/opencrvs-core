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
                      label: 'Health Worker'
                    },
                    {
                      lang: 'fr',
                      label: 'Professionnel de Santé'
                    }
                  ]
                },
                {
                  _id: '63da2e0e079116030b195d9a',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Police Worker'
                    },
                    {
                      lang: 'fr',
                      label: 'Agent de Police'
                    }
                  ]
                },
                {
                  _id: '63da2e0e079116030b195d9b',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Social Worker'
                    },
                    {
                      lang: 'fr',
                      label: 'Travailleur Social'
                    }
                  ]
                },
                {
                  _id: '63da2e0e079116030b195d9c',
                  labels: [
                    {
                      lang: 'en',
                      label: 'Local Leader'
                    },
                    {
                      lang: 'fr',
                      label: 'Leader Local'
                    }
                  ]
                }
              ]
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
            value: 'FIELD_AGENT',
            active: false,
            roles: [
              {
                _id: '63da2e0e079116030b195d99',
                labels: [
                  {
                    lang: 'en',
                    label: 'Health Worker'
                  },
                  {
                    lang: 'fr',
                    label: 'Professionnel de Santé'
                  }
                ]
              },
              {
                _id: '63da2e0e079116030b195d9a',
                labels: [
                  {
                    lang: 'en',
                    label: 'Police Worker'
                  },
                  {
                    lang: 'fr',
                    label: 'Agent de Police'
                  }
                ]
              },
              {
                _id: '63da2e0e079116030b195d9b',
                labels: [
                  {
                    lang: 'en',
                    label: 'Social Worker'
                  },
                  {
                    lang: 'fr',
                    label: 'Travailleur Social'
                  }
                ]
              },
              {
                _id: '63da2e0e079116030b195d9c',
                labels: [
                  {
                    lang: 'en',
                    label: 'Local Leader'
                  },
                  {
                    lang: 'fr',
                    label: 'Leader Local'
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
      graphqlMocks: mocks
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
  })

  it('should show the update system model after click the change button', async () => {
    component.find('#changeButton').hostNodes().first().simulate('click')
    console.log(component.debug())
    expect(component.exists('ResponsiveModal')).toBeTruthy()
  })

  it.only('should show the update system  role success message after click the change button', async () => {
    component.find('#changeButton').hostNodes().simulate('click')
    console.log(component.debug())

    await waitForElement(component, '#ResponsiveModal')
    console.log(component.debug())
    component.find('#confirm').hostNodes().simulate('click')

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()

    expect(component.exists('#updateRoleSuccess')).toBeTruthy()
  })
})
