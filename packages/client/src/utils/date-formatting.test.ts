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
import { formatLongDate } from '@client/utils/date-formatting'

describe('date formatting tests', () => {
  it('formats long date with localization', () => {
    expect(formatLongDate('2018-11-15', 'en')).toBe('15 November 2018')
    expect(formatLongDate('2018-11-15', 'bn')).toBe('15 নভেম্বর 2018')
  })
})
