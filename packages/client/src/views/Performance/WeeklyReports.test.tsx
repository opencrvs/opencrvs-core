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
import { Button } from '@opencrvs/components/lib/buttons'
import { ListTable } from '@opencrvs/components/lib/interface'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { WeeklyReports } from './WeeklyReports'

describe('Weekly report', () => {
  const { store, history } = createStore()
  let app: ReactWrapper

  beforeAll(async () => {
    app = (await createTestComponent(<WeeklyReports />, store)).component
    app.update()
  })

  it('loads weekly report list table', () => {
    expect(app.find(ListTable)).toHaveLength(2)
  })

  it('redirects to report page', async () => {
    app
      .find(ListTable)
      .first()
      .find('#row_0')
      .hostNodes()
      .find(Button)
      .first()
      .simulate('click')
    app.update()

    expect(history.location.pathname).toBe('/performance/report')
  })
})
