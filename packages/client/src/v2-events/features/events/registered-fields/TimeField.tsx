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
import {
  TimeField as TimeFieldComponent,
  ITimeFieldProps as TimeFieldProps
} from '@opencrvs/components/lib/TimeField'
import { TimeValue } from '@opencrvs/commons/client'

const messages = defineMessages({
  timeFormat: {
    defaultMessage: 'HH:mm',
    id: 'configuration.timeField.outputFormat',
    description: 'Default format for time values'
  }
})

const EMPTY_TIME = '--'

function resolveNowForTimeInput(value: string): string {
  if (value === '$$now') {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
  }

  return value
}

function TimeInput({
  onChange,
  value = '',
  ...props
}: TimeFieldProps & {
  onChange: (newValue: string) => void
  value: string
}) {
  const resolvedValue = resolveNowForTimeInput(value)
  const cleanEmpty = React.useCallback(
    (val: string) => (val === EMPTY_TIME ? '' : val),
    []
  )

  const handleChange = React.useCallback(
    (val: string) => {
      const cleaned = cleanEmpty(val)
      if (cleaned !== resolvedValue) {
        onChange(cleaned)
      }
    },
    [resolvedValue, onChange, cleanEmpty]
  )

  return (
    <TimeFieldComponent
      {...props}
      data-testid={`${props.id}`}
      value={resolvedValue}
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
