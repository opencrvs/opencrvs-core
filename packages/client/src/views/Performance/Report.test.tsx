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
import { PERFORMANCE_REPORT } from '@client/navigation/routes'
import { createTestApp } from '@client/tests/util'
import { PERFORMANCE_REPORT_TYPE_WEEKY } from '@client/utils/constants'
import { ReactWrapper } from 'enzyme'
import { History } from 'history'
import { Header } from './utils'

describe('Report page', () => {
  let app: ReactWrapper
  let history: History

  beforeEach(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    history = testApp.history

    history.replace('')
    app.update()
  })

  describe('Report page with defined prop', () => {
    beforeEach(() => {
      history.replace(PERFORMANCE_REPORT, {
        reportType: PERFORMANCE_REPORT_TYPE_WEEKY,
        title: 'Test title'
      })
      app.update()
    })

    it('loads with page title', () => {
      expect(
        app
          .find(Header)
          .first()
          .text()
      ).toBe('Test title')
    })
  })
})
