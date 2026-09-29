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
import { EventState } from '@opencrvs/commons/client'

import { liveAnchorDate } from './utils'

const dateOfEvent = { $$field: 'child.dob', $$subfield: [] }

describe('liveAnchorDate', () => {
  it('uses the date-of-event field value read live off the form', () => {
    const form: EventState = { 'child.dob': '1995-04-25' }

    expect(
      liveAnchorDate({ dateOfEvent, form, createdAt: '2026-07-28T00:00:00Z' })
    ).toBe('1995-04-25')
  })

  it('falls back to createdAt when the field is not configured', () => {
    const form: EventState = { 'child.dob': '1995-04-25' }

    expect(
      liveAnchorDate({
        dateOfEvent: undefined,
        form,
        createdAt: '2020-01-01T10:00:00.000Z'
      })
    ).toBe('2020-01-01')
  })

  it('falls back to createdAt when the field is empty', () => {
    const form: EventState = {}

    expect(
      liveAnchorDate({ dateOfEvent, form, createdAt: '2020-01-01T10:00:00Z' })
    ).toBe('2020-01-01')
  })

  it('falls back to createdAt when the form holds a partial, invalid date', () => {
    // e.g. a date field mid-keystroke, not yet a complete date.
    const form: EventState = { 'child.dob': '2021-01-' }

    expect(
      liveAnchorDate({ dateOfEvent, form, createdAt: '2020-01-01T10:00:00Z' })
    ).toBe('2020-01-01')
  })

  it('truncates a datetime createdAt to its plain date when falling back', () => {
    const form: EventState = {}

    expect(
      liveAnchorDate({
        dateOfEvent,
        form,
        createdAt: '2020-06-15T23:59:59.999Z'
      })
    ).toBe('2020-06-15')
  })
})
