/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { formatTimeDuration } from './DateUtils'

describe('Date utilities', () => {
  it('formats time duration in seconds to days, hours, minutes and seconds', () => {
    const formattedTimeDuration = formatTimeDuration(96020)
    expect(formattedTimeDuration).toStrictEqual({
      days: '01',
      hours: '02',
      minutes: '40',
      seconds: '20'
    })
  })
})
