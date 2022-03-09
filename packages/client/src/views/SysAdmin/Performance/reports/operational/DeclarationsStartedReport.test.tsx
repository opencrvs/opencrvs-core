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
import { DeclarationsStartedReport } from './DeclarationsStartedReport'
import { createStore } from '@client/store'
import * as React from 'react'
import { GQLDeclarationsStartedMetrics } from '@opencrvs/gateway/src/graphql/schema'
import * as locationUtils from '@client/utils/locationUtils'
import moment from 'moment'

describe('Registration rates report', () => {
  const { store, history } = createStore()
  beforeEach(async () => {
    jest.spyOn(locationUtils, 'getJurisidictionType').mockReturnValue('UNION')
  })

  it('renders loading indicator', async () => {
    const component = await createTestComponent(
      <DeclarationsStartedReport
        loading={true}
        locationId={'c879ce5c-545b-4042-98a6-77015b0e13df'}
        reportTimeFrom={moment(new Date())}
        reportTimeTo={moment(new Date())}
      />,
      { store, history }
    )
    expect(
      component.find('#declarations-started-reports-loader').hostNodes()
    ).toHaveLength(1)
    expect(
      component.find('#declarations-started-reports').hostNodes()
    ).toHaveLength(0)
  })

  it('renders reports', async () => {
    const data: GQLDeclarationsStartedMetrics = {
      fieldAgentDeclarations: 2,
      hospitalDeclarations: 1,
      officeDeclarations: 2
    }
    const component = await createTestComponent(
      <DeclarationsStartedReport
        data={data}
        locationId={'c879ce5c-545b-4042-98a6-77015b0e13df'}
        reportTimeFrom={moment(new Date())}
        reportTimeTo={moment(new Date())}
      />,
      { store, history }
    )

    expect(
      component.find('#declarations-started-reports-loader').hostNodes()
    ).toHaveLength(0)
    expect(
      component.find('#declarations-started-reports').hostNodes()
    ).toHaveLength(1)
    expect(component.find('#total-declarations').hostNodes().text()).toBe('5')
    expect(component.find('#field-agent-percentage').hostNodes().text()).toBe(
      '(40%)'
    )
  })
})
