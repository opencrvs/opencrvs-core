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
import { createStore } from '@register/store'
import { createTestComponent } from '@register/tests/util'
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@register/utils/constants'
import { ReactWrapper } from 'enzyme'
import * as React from 'react'
import { ReportList } from './ReportList'
import { WeeklyReports } from './WeeklyReports'

describe('Report list', () => {
  const { store } = createStore()
  let app: ReactWrapper

  describe('Report list with defined param', () => {
    beforeAll(async () => {
      app = (await createTestComponent(
        // @ts-ignore
        <ReportList
          match={{
            params: {
              reportType: PERFORMANCE_REPORT_TYPE_WEEKY
            },
            isExact: true,
            path: '',
            url: ''
          }}
        />,
        store
      )).component
      app.update()
    })

    it('loads list table', () => {
      expect(app.find(WeeklyReports)).toHaveLength(1)
    })
  })

  describe('Report list with default param', () => {
    beforeAll(async () => {
      app = (await createTestComponent(
        // @ts-ignore
        <ReportList match={{ params: {} }} />,
        store
      )).component
      app.update()
    })

    it('loads list table', () => {
      expect(app.find(WeeklyReports)).toHaveLength(1)
    })
  })
})
