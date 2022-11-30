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
import { AppStore } from '@client/store'
import {
  createRouterProps,
  createTestComponent,
  createTestStore,
  flushPromises
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import * as React from 'react'
import { GET_USER } from '@client/user/queries'
import { UserAudit } from '@client/views/UserAudit/UserAudit'
import { userMutations } from '@client/user/mutations'
import { vi, Mock } from 'vitest'

import * as Router from 'react-router'

const useParams = Router.useParams as Mock

describe('User audit list tests', () => {
  userMutations.resendSMSInvite = vi.fn()
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History<any>

  const graphqlMock = [
    {
      request: {
        query: GET_USER,
        variables: {
          userId: '5d08e102542c7a19fc55b790'
        }
      },
      result: {
        data: {
          getUser: {
            id: '5d08e102542c7a19fc55b790',
            name: [
              {
                use: 'bn',
                firstNames: '',
                familyName: 'মায়ের পারিবারিক নাম'
              },
              {
                use: 'en',
                firstNames: '',
                familyName: 'Shakib al Hasan'
              }
            ],
            username: 'shakib.alhasan',
            mobile: '+8801662132163',
            identifier: {
              system: 'NATIONAL_ID',
              value: '1014881922'
            },
            role: 'FIELD_AGENT',
            type: 'CHA',
            status: 'active',
            underInvestigation: true,
            practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
            primaryOffice: {
              id: '895cc945-94a9-4195-9a29-22e9310f3385',
              name: 'Narsingdi Paurasabha',
              alias: ['নরসিংদী পৌরসভা']
            },
            catchmentArea: [
              {
                id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
                name: 'Sample location',
                alias: 'স্যাম্পল লোকেশান',
                identifier: [
                  {
                    system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                    value: 'UNION'
                  }
                ]
              }
            ],
            creationDate: '2019-03-31T18:00:00.000Z'
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)

    useParams.mockImplementation(() => ({
      userId: '5d08e102542c7a19fc55b790'
    }))

    const { store: testStore, history: testHistory } = await createTestStore()
    store = testStore
    history = testHistory
    component = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: graphqlMock
    })
  })

  it('renders without crashing', async () => {
    expect(await waitForElement(component, '#user-audit-list')).toBeDefined()
  })

  it('renders with a error toast for graphql error', async () => {
    const testComponent = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: []
    })
    expect(await waitForElement(testComponent, '#error-toast')).toBeDefined()
  })

  it('redirects to edit user view on clicking edit details menu option', async () => {
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')
    const editUserLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem0'
    )
    editUserLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await flushPromises()

    expect(history.location.pathname).toBe(
      '/user/5d08e102542c7a19fc55b790/preview/'
    )
  })
  it('clicking office link redirects user to userlist of primary office', async () => {
    const officeLink = await waitForElement(component, '#office-link')
    officeLink.hostNodes().simulate('click')

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
    expect(history.location.pathname).toBe('/team/users')
  })
  it('sends invite on clicking resend sms invite menu option', async () => {
    ;(userMutations.resendSMSInvite as Mock).mockResolvedValueOnce({
      data: { resendSMSInvite: 'true' }
    })
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const deactivationLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem1'
    )
    deactivationLink.hostNodes().simulate('click')

    await flushPromises()

    component.update()

    expect(
      await waitForElement(component, '#resend_invite_success')
    ).toBeDefined()
  })
  it('shows error on clicking resend sms invite menu option if there is any', async () => {
    ;(userMutations.resendSMSInvite as Mock).mockRejectedValueOnce(
      new Error('Something went wrong')
    )
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const deactivationLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem1'
    )
    deactivationLink.hostNodes().simulate('click')

    await flushPromises()

    component.update()

    expect(
      await waitForElement(component, '#resend_invite_error')
    ).toBeDefined()
  })
  //NEED TO FIX
  it('opens deactivation modal on clicking deactivate menu option', async () => {
    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const deactivationLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem2'
    )
    deactivationLink.hostNodes().simulate('click')

    expect(await waitForElement(component, '#deactivate-action')).toBeDefined()
  })
  //NEED TO FIX
  it('opens activation modal on clicking deactivate menu option', async () => {
    // @ts-ignore
    graphqlMock[0].result.data.getUser.status = 'deactivated'
    component = await createTestComponent(<UserAudit />, {
      store,
      history,
      graphqlMocks: graphqlMock
    })

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()

    const menuLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonToggleButton'
    )
    menuLink.hostNodes().simulate('click')

    const activationLink = await waitForElement(
      component,
      '#sub-page-header-munu-buttonItem1'
    )
    activationLink.hostNodes().simulate('click')

    expect(await waitForElement(component, '#reactivate-action')).toBeDefined()
  })
})
