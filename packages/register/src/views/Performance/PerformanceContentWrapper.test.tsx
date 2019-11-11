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
import { createStore } from '@register/store'
import { createTestComponent } from '@register/tests/util'
import { PerformanceContentWrapper } from './PerformanceContentWrapper'
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@register/utils/constants'
import { ReactWrapper } from 'enzyme'

describe('Performance content wrapper', () => {
  const { store } = createStore()

  describe('Tab menu', () => {
    let app: ReactWrapper

    beforeAll(async () => {
      app = (await createTestComponent(
        <PerformanceContentWrapper tabId={PERFORMANCE_REPORT_TYPE_WEEKY} />,
        store
      )).component
      app.update()
    })

    it('loads all the tabs', () => {
      expect(app.find('#tab_weekly').hostNodes()).toHaveLength(1)
    })

    it('sets active status to selected tab', () => {
      expect(
        app
          .find('#tab_weekly')
          .first()
          .prop('active')
      ).toBeTruthy()
    })
  })
})
