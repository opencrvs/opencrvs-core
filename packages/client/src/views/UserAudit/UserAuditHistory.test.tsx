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
  createTestStore
} from '@client/tests/util'
import { waitForElement } from '@client/tests/wait-for-element'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { GET_USER_AUDIT_LOG } from '@client/user/queries'
import { UserAuditHistory } from '@client/views/UserAudit/UserAuditHistory'
import { History } from 'history'
import { vi } from 'vitest'
import { getTheme } from '@opencrvs/components'
import { TEAM_USER_LIST } from '@client/navigation/routes'
import { formatUrl } from '@client/navigation'

describe('User audit list tests', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History

  const graphqlMock = [
    {
      request: {
        query: GET_USER_AUDIT_LOG,
        variables: {
          practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
          count: 10,
          skip: 0
        }
      },
      result: {
        data: {
          getUserAuditLog: {
            total: 2,
            results: [
              {
                ipAddress: 'localhost',
                practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
                userAgent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
                action: 'REGISTERED',
                time: '2019-03-31T18:00:00.000Z',
                data: {
                  compositionId: '80b90ac3-1032-4f98-af64-627d2b7443f3',
                  trackingId: 'D23S2D0'
                }
              },
              {
                ipAddress: 'localhost',
                practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
                userAgent:
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
                action: 'REGISTERED',
                time: '2019-03-29T18:00:00.000Z',
                data: {
                  compositionId: '80b90ac3-1032-4f98-af64-627d2b7443f3',
                  trackingId: 'D23S2D01'
                }
              }
            ]
          }
        }
      }
    }
  ]

  beforeEach(async () => {
    Date.now = vi.fn(() => 1487076708000)
    ;({ store, history } = await createTestStore())
    component = await createTestComponent(
      // @ts-ignore
      <UserAuditHistory
        practitionerId="94429795-0a09-4de8-8e1e-27dab01877d2"
        {...createRouterProps(
          formatUrl(TEAM_USER_LIST, {
            userId: '5d08e102542c7a19fc55b790'
          }),
          { isNavigatedInsideApp: false },
          {
            matchParams: {
              userId: '5d08e102542c7a19fc55b790'
            }
          }
        )}
      />,
      { store, history, graphqlMocks: graphqlMock }
    )

    // wait for mocked data to load mockedProvider
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    component.update()
  })

  it('renders without crashing', async () => {
    expect(await waitForElement(component, '#user-audit-list')).toBeDefined()
  })

  it('renders in loading mode', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserAuditHistory isLoading={true} />,
      {
        store,
        history
      }
    )
    expect(
      await waitForElement(testComponent, '#loading-audit-list')
    ).toBeDefined()
  })
  it('renders with a error toast for graphql error', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserAuditHistory userDetails={null} />,
      { store, history }
    )
    expect(await waitForElement(testComponent, '#error-toast')).toBeDefined()
  })
  it('toggles sorting order of the list', async () => {
    console.log(component.debug())
    const firstRowElement = await waitForElement(component, '#row_0')
    const toggleSortActionElement = await waitForElement(
      component,
      '#auditTime-label'
    )
    const firstTrackingId = firstRowElement.hostNodes().childAt(1).text()

    toggleSortActionElement.hostNodes().simulate('click')
    const firstRowElementAfterSort = await waitForElement(component, '#row_0')
    expect(firstRowElementAfterSort.hostNodes().childAt(1).text()).not.toBe(
      firstTrackingId
    )
  })

  // TODO: Implement this test when UserAudit is enabled again / reworked
  it.skip('renders next page of audits after clicking next page', async () => {
    const testComponent = await createTestComponent(
      // @ts-ignore
      <UserAuditHistory
        userDetails={{
          role: 'FIELD_AGENT',
          type: 'CHA',
          status: 'active',
          practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2'
        }}
        history={history}
        theme={getTheme()}
      />,
      {
        store,
        history,
        graphqlMocks: [
          graphqlMock[0],
          {
            request: {
              query: GET_USER_AUDIT_LOG,
              variables: {
                practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
                count: 10,
                skip: 0
              }
            },
            result: {
              data: {
                getUserAuditLog: {
                  total: 1,
                  results: [
                    {
                      ipAddress: 'localhost',
                      practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
                      userAgent:
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
                      action: 'REGISTERED',
                      time: '2019-03-31T18:00:00.000Z',
                      data: {
                        compositionId: '80b90ac3-1032-4f98-af64-627d2b7443f3',
                        trackingId: 'D23S2D0'
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    )

    // const loadMoreLink = await waitForElement(testComponent, '#page-number-1')
    // expect(loadMoreLink.hostNodes()).toHaveLength(2)
    // loadMoreLink.hostNodes().first().simulate('click')
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 100)
    // })
    // testComponent.update()
    expect(testComponent.find('#page-number-1').hostNodes()).toHaveLength(0)
  })
})
