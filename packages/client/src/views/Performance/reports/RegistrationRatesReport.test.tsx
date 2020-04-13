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
import { RegistrationRatesReport } from './RegistrationRatesReport'
import { createStore } from '@client/store'
import * as React from 'react'
import { GQLEventEstimationMetrics } from '@opencrvs/gateway/src/graphql/schema'

describe('Registration rates report', () => {
  const { store } = createStore()

  it('renders loading indicator', async () => {
    const { component } = await createTestComponent(
      <RegistrationRatesReport loading={true} />,
      store
    )

    expect(component.find('#reports-loader').hostNodes()).toHaveLength(1)
    expect(component.find('#reports').hostNodes()).toHaveLength(0)
  })

  it('renders reports', async () => {
    const data: GQLEventEstimationMetrics = {
      birth45DayMetrics: {
        actualRegistration: 0,
        estimatedPercentage: 0,
        estimatedRegistration: 0,
        malePercentage: 0,
        femalePercentage: 0
      },
      death45DayMetrics: {
        actualRegistration: 0,
        estimatedPercentage: 0,
        estimatedRegistration: 0,
        malePercentage: 0,
        femalePercentage: 0
      }
    }
    const { component } = await createTestComponent(
      <RegistrationRatesReport data={data} />,
      store
    )

    expect(component.find('#reports-loader').hostNodes()).toHaveLength(0)
    expect(component.find('#reports').hostNodes()).toHaveLength(1)
  })
})
