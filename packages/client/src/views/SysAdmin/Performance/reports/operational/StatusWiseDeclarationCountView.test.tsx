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
import { offlineDataReady } from '@client/offline/actions'
import { queries } from '@client/profile/queries'
import { AppStore } from '@client/store'
import {
  createTestComponent,
  createTestStore,
  flushPromises,
  mockOfflineDataDispatch,
  mockRegistrarUserResponse,
  REGISTRAR_DEFAULT_SCOPES,
  setScopes
} from '@client/tests/util'
import { StatusWiseDeclarationCountView } from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'
import * as React from 'react'
import type { GQLRegistrationCountResult } from '@client/utils/gateway-deprecated-do-not-use'
import { ReactWrapper } from 'enzyme'
import * as locationUtils from '@client/utils/locationUtils'
import { waitForElement } from '@client/tests/wait-for-element'
import { EventType } from '@client/utils/gateway'
import { StatusMapping } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { vi } from 'vitest'

const mockFetchUserDetails = vi.fn()
mockFetchUserDetails.mockReturnValue(mockRegistrarUserResponse)
queries.fetchUserDetails = mockFetchUserDetails

describe('Status wise registration count', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore

  beforeEach(async () => {
    const storeContext = await createTestStore()
    store = storeContext.store

    setScopes(REGISTRAR_DEFAULT_SCOPES, store)
    store.dispatch(offlineDataReady(mockOfflineDataDispatch))
    await flushPromises()
    vi.spyOn(locationUtils, 'getJurisidictionType').mockReturnValue('UNION')
  })

  describe('when it has data in props', () => {
    const onClickStatusDetailsMock = vi.fn()
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
      const { component: testComponent } = await createTestComponent(
        <StatusWiseDeclarationCountView
          selectedEvent={EventType.Birth}
          data={data}
          isAccessibleOffice={true}
          statusMapping={StatusMapping}
          onClickStatusDetails={onClickStatusDetailsMock}
        />,
        { store }
      )
      component = testComponent
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
