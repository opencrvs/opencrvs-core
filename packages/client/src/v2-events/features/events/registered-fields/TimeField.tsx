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
import { useField } from 'formik'
import {
  TimeField as TimeFieldComponent,
  ITimeFieldProps as TimeFieldProps
} from '@opencrvs/components/lib/TimeField'
import { SerializedNowDateTime, TimeValue } from '@opencrvs/commons/client'
import { useResolveDefaultValue } from '../useResolveDefaultValue'

const messages = defineMessages({
  timeFormat: {
    defaultMessage: 'HH:mm',
    id: 'configuration.timeField.outputFormat',
    description: 'Default format for time values'
  }
})

const EMPTY_TIME = '--'

function resolveNowForTimeInput(value: string | SerializedNowDateTime): string {
  if (SerializedNowDateTime.safeParse(value).success) {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
  }

  return value.toString()
}

function TimeInput({
  onChange,
  value = '',
  ...props
}: TimeFieldProps & {
  onChange: (newValue: string) => void
  value: string | SerializedNowDateTime
}) {
  const cleanEmpty = React.useCallback(
    (val: string) => (val === EMPTY_TIME ? '' : val),
    []
  )

  // Ensure that 'now' is resolved to the current date and set in the form data.
  // Form values are updated in a single batched operation.
  // When multiple fields try to resolve `$$now` at the same time,
  // each calls `setValues`, but only the *last* update in the batch
  // is applied.
  //
  // Example:
  // applicant.dob = { $$now: true }, applicant.tob = "15:34"
  // applicant.dob = "1990-01-01", applicant.tob = { $$now: true }
  // → only one resolved field survives per render cycle.
  //
  // `useField` is used to get access to `helpers.setValue`, ensuring
  // the resolved value is written directly to Formik’s state rather
  // than relying on local `onChange`, which may be overwritten.
  const resolvedValue = useResolveDefaultValue({
    defaultValue: value,
    resolver: resolveNowForTimeInput,
    fieldName: props.name
  })

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
