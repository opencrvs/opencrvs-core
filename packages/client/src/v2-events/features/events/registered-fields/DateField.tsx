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
import { defineMessages, useIntl } from 'react-intl'
import { DateValue } from '@opencrvs/commons/client'
import {
  DateField as DateFieldComponent,
  IDateFieldProps as DateFieldProps
} from '@opencrvs/components/lib/DateField'

const messages = defineMessages({
  dateFormat: {
    defaultMessage: 'd MMMM y',
    id: 'v2.configuration.dateFormat',
    description: 'Default format for date values'
  }
})

const EMPTY_DATE = '--'

function DateInput({
  onChange,
  value = '',
  ...props
}: DateFieldProps & {
  onChange: (newValue: string) => void
  value: string
}) {
  /**
   * Component library returns '--' for empty dates when input has been touched.
   * We limit the behavior to this component, while still allowing partial values. (e.g. '2021-01-')
   */
  const cleanEmpty = (val: string) => (val === EMPTY_DATE ? '' : val)
  const cleanOnChange = (val: string) => onChange(cleanEmpty(val))

  return (
    <DateFieldComponent
      {...props}
      data-testid={`${props.id}`}
      value={value}
      onBlur={(e) => {
        const segmentType = String(e.target.id.split('-').pop())
        const val = e.target.value
        const dateSegmentVals = value.split('-')

        // Add possibly missing leading 0 for days and months
        if (segmentType === 'dd' && val.length === 1) {
          cleanOnChange(`${dateSegmentVals[0]}-${dateSegmentVals[1]}-0${val}`)
        }

        if (segmentType === 'mm' && val.length === 1) {
          cleanOnChange(`${dateSegmentVals[0]}-0${val}-${dateSegmentVals[2]}`)
        }

        return props.onBlur && props.onBlur(e)
      }}
      onChange={cleanOnChange}
    />
  )
}

function DateOutput({ value }: { value?: string }) {
  const intl = useIntl()
  const parsed = DateValue.safeParse(value)

  if (parsed.success) {
    return format(
      new Date(parsed.data),
      intl.formatMessage(messages.dateFormat)
    )
  }

  return value ?? ''
}

export const DateField = {
  Input: DateInput,
  Output: DateOutput
}
