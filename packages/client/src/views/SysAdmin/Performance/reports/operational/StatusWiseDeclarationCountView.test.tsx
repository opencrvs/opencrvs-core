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
import {
  createTestComponent,
  createTestStore,
  mockOfflineDataDispatch,
  mockRegistrarUserResponse
} from '@client/tests/util'
import { queries } from '@client/profile/queries'
import { checkAuth } from '@opencrvs/client/src/profile/profileActions'
import { StatusWiseDeclarationCountView } from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'
import { AppStore, createStore } from '@client/store'
import * as React from 'react'
import { GQLRegistrationCountResult } from '@opencrvs/gateway/src/graphql/schema'
import { ReactWrapper } from 'enzyme'
import * as locationUtils from '@client/utils/locationUtils'
import * as performanceUtils from '@client/views/SysAdmin/Performance/utils'
import { waitForElement } from '@client/tests/wait-for-element'
import { StatusMapping } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { Event } from '@client/forms'
import { History } from 'history'
import { offlineDataReady } from '@client/offline/actions'

const registerScopeToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWdpc3RlciIsImNlcnRpZnkiLCJkZW1vIl0sImlhdCI6MTU0MjY4ODc3MCwiZXhwIjoxNTQzMjkzNTcwLCJhdWQiOlsib3BlbmNydnM6YXV0aC11c2VyIiwib3BlbmNydnM6dXNlci1tZ250LXVzZXIiLCJvcGVuY3J2czpoZWFydGgtdXNlciIsIm9wZW5jcnZzOmdhdGV3YXktdXNlciIsIm9wZW5jcnZzOm5vdGlmaWNhdGlvbi11c2VyIiwib3BlbmNydnM6d29ya2Zsb3ctdXNlciJdLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI1YmVhYWY2MDg0ZmRjNDc5MTA3ZjI5OGMifQ.ElQd99Lu7WFX3L_0RecU_Q7-WZClztdNpepo7deNHqzro-Cog4WLN7RW3ZS5PuQtMaiOq1tCb-Fm3h7t4l4KDJgvC11OyT7jD6R2s2OleoRVm3Mcw5LPYuUVHt64lR_moex0x_bCqS72iZmjrjS-fNlnWK5zHfYAjF2PWKceMTGk6wnI9N49f6VwwkinJcwJi6ylsjVkylNbutQZO0qTc7HRP-cBfAzNcKD37FqTRNpVSvHdzQSNcs7oiv3kInDN5aNa2536XSd3H-RiKR9hm9eID9bSIJgFIGzkWRd5jnoYxT70G0t03_mTVnDnqPXDtyI-lmerx24Ost0rQLUNIg'
const getItem = window.localStorage.getItem as jest.Mock

const mockFetchUserDetails = jest.fn()
mockFetchUserDetails.mockReturnValue(mockRegistrarUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

describe('Status wise registration count', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History
  beforeEach(async () => {
    const storeContext = await createTestStore()
    store = storeContext.store
    history = storeContext.history
    getItem.mockReturnValue(registerScopeToken)
    await store.dispatch(checkAuth())
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    jest.spyOn(locationUtils, 'getJurisidictionType').mockReturnValue('UNION')
    jest
      .spyOn(performanceUtils, 'isUnderJurisdictionOfUser')
      .mockReturnValue(true)
  })

  describe('when it has data in props', () => {
    const onClickStatusDetailsMock = jest.fn()
    beforeEach(async () => {
      const data: GQLRegistrationCountResult = {
        results: [
          { status: 'IN_PROGRESS', count: 0 },
          { status: 'DECLARED', count: 1 },
          { status: 'REJECTED', count: 2 },
          { status: 'VALIDATED', count: 3 },
          { status: 'WAITING_VALIDATION', count: 4 },
          { status: 'REGISTERED', count: 5 }
        ],
        total: 15
      }
      component = await createTestComponent(
        <StatusWiseDeclarationCountView
          selectedEvent={Event.BIRTH}
          data={data}
          locationId={'c879ce5c-545b-4042-98a6-77015b0e13df'}
          statusMapping={StatusMapping}
          onClickStatusDetails={onClickStatusDetailsMock}
        />,
        { store, history }
      )
    })
    it('renders status count view with progress bars', async () => {
      expect(component.find('#declaration-statuses').hostNodes()).toHaveLength(
        1
      )
    })

    it('clicking on title link triggers onClickStatusDetails', async () => {
      const registeredTitleLink = await waitForElement(
        component,
        '#in_progress-0-title-link'
      )
      registeredTitleLink.hostNodes().simulate('click')
      expect(onClickStatusDetailsMock).toBeCalledWith('IN_PROGRESS')
    })
  })
})
