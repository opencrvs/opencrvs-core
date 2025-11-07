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

import format from 'date-fns/format'
import * as React from 'react'
import { defineMessages, IntlShape, useIntl } from 'react-intl'
import { z } from 'zod'
import {
  TimeField as TimeFieldComponent,
  ITimeFieldProps as TimeFieldProps
} from '@opencrvs/components/lib/TimeField'

const messages = defineMessages({
  timeFormat: {
    defaultMessage: 'HH:mm',
    id: 'configuration.timeFormat',
    description: 'Default format for time values'
  }
})

const EMPTY_TIME = '--'

// Time validation schema (HH:mm in 24 hour format)
const TimeValue = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)

function TimeInput({
  onChange,
  value = '',
  ...props
}: TimeFieldProps & {
  onChange: (newValue: string) => void
  value: string
}) {
  const cleanEmpty = React.useCallback(
    (val: string) => (val === EMPTY_TIME ? '' : val),
    []
  )

  const handleChange = React.useCallback(
    (val: string) => {
      const cleaned = cleanEmpty(val)
      if (cleaned !== value) {
        onChange(cleaned)
      }
    },
    [value, onChange, cleanEmpty]
  )

  return (
    <TimeFieldComponent
      {...props}
      data-testid={`${props.id}`}
      value={value}
      onChange={handleChange}
    />
  )
}

function parseAndFormatTime(intl: IntlShape, value?: string) {
  const parsed = TimeValue.safeParse(value)

  if (!parsed.success) {
    return String(value ?? '')
  }

  const dummyDate = new Date()

  const [hourStr, minuteStr] = parsed.data.split(':')

  const hours = parseInt(hourStr, 10)
  const minutes = parseInt(minuteStr, 10)

  dummyDate.setHours(hours)
  dummyDate.setMinutes(minutes)

  return format(dummyDate, intl.formatMessage(messages.timeFormat))
}

function TimeOutput({ value }: { value?: string }) {
  const intl = useIntl()
  return parseAndFormatTime(intl, value)
}

function stringify(value: string | undefined, context: { intl: IntlShape }) {
  return parseAndFormatTime(context.intl, value)
}

export const TimeField = {
  Input: TimeInput,
  Output: TimeOutput,
  stringify
}
