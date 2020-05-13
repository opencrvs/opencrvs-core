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
import { StatusWiseApplicationCountView } from '@client/views/Performance/reports/operational/StatusWiseApplicationCountView'
import { StatusMapping } from '@client/views/Performance/OperationalReport'
import { createStore } from '@client/store'
import * as React from 'react'
import { GQLRegistrationCountResult } from '@opencrvs/gateway/src/graphql/schema'
import { ReactWrapper } from 'enzyme'

describe('Status wise registration count', () => {
  const { store } = createStore()

  it('renders loading indicator', async () => {
    const { component } = await createTestComponent(
      <StatusWiseApplicationCountView
        loading={true}
        statusMapping={StatusMapping}
      />,
      store
    )

    expect(component.find('#status-header-loader').hostNodes()).toHaveLength(1)
    expect(component.find('#status-header').hostNodes()).toHaveLength(0)
  })

  describe('when it has data in props', () => {
    let component: ReactWrapper<{}, {}>
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
      component = (await createTestComponent(
        <StatusWiseApplicationCountView
          data={data}
          statusMapping={StatusMapping}
        />,
        store
      )).component
    })
    it('renders status count view with progress bars', async () => {
      expect(component.find('#status-header-loader').hostNodes()).toHaveLength(
        0
      )
      expect(component.find('#status-header').hostNodes()).toHaveLength(1)
    })
  })
})
