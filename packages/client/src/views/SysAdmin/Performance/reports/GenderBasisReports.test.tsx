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
import { GenderBasisReports } from './GenderBasisReports'
import { Event } from '@client/forms'

describe('Gender basis report tests', () => {
  const { store } = createStore()
  const genderBasisMetrics = {
    details: [
      {
        location: 'Location/d5ccd1d1-ca47-435b-93db-36c626ad2dfa',
        femaleOver18: 5,
        maleOver18: 5,
        maleUnder18: 5,
        femaleUnder18: 5,
        total: 20
      }
    ],
    total: {
      femaleOver18: 5,
      maleOver18: 5,
      maleUnder18: 5,
      femaleUnder18: 5,
      total: 20
    }
  }

  it('Renders without crashing', async () => {
    const testComponent = await createTestComponent(
      <GenderBasisReports
        eventType={Event.BIRTH}
        genderBasisMetrics={genderBasisMetrics}
        loading={false}
      />,
      store
    )

    const total = testComponent.component.find('#row_0').find('span').at(6)

    expect(total.text()).toBe('20')
  })
})
