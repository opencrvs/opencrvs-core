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
import * as React from 'react'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { TimeFrameReports } from '@client/views/SysAdmin/Performance/reports/TimeFrameReports'
import { Event } from '@client/forms'

describe('Time frame report tests', () => {
  const { store, history } = createStore()
  const timeFramesData = {
    details: [
      {
        locationId: 'Location/d5ccd1d1-ca47-435b-93db-36c626ad2dfa',
        regWithin45d: 0,
        regWithin45dTo1yr: 0,
        regWithin1yrTo5yr: 0,
        regOver5yr: 2,
        total: 2
      }
    ],
    total: {
      regWithin45d: 0,
      regWithin45dTo1yr: 0,
      regWithin1yrTo5yr: 0,
      regOver5yr: 2,
      total: 2
    }
  }

  it('Renders without crashing', async () => {
    const testComponent = await createTestComponent(
      <TimeFrameReports
        eventType={Event.BIRTH}
        data={timeFramesData}
        loading={false}
      />,
      { store, history }
    )

    const columnValueOfRegOver5Year = testComponent
      .find('#row_0')
      .find('span')
      .at(5)

    expect(columnValueOfRegOver5Year.text()).toBe('2 (100%)')
  })
})
