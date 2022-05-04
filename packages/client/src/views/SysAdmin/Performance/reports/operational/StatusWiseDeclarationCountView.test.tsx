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
import { createTestComponent } from '@client/tests/util'
import { StatusWiseDeclarationCountView } from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'

import { createStore } from '@client/store'
import * as React from 'react'
import { GQLRegistrationCountResult } from '@opencrvs/gateway/src/graphql/schema'
import { ReactWrapper } from 'enzyme'
import * as locationUtils from '@client/utils/locationUtils'
import { waitForElement } from '@client/tests/wait-for-element'
import { StatusMapping } from '@client/views/SysAdmin/Performance/WorkflowStatus'
import { Event } from '@client/forms'

describe('Status wise registration count', () => {
  const { store, history } = createStore()
  beforeEach(async () => {
    jest.spyOn(locationUtils, 'getJurisidictionType').mockReturnValue('UNION')
  })

  describe('when it has data in props', () => {
    let component: ReactWrapper<{}, {}>
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
