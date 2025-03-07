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
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import {
  DateField as DateFieldComponent,
  IDateFieldProps
} from '@opencrvs/components/lib/DateField'
import { DateValue } from '@opencrvs/commons/client'

const messages = defineMessages({
  dateFormat: {
    defaultMessage: 'd MMMM y',
    id: 'v2.configuration.dateFormat',
    description: 'Default format for date values'
  }
})

type DateFieldProps = Omit<IDateFieldProps, 'onChange' | 'onBlur'> & {
  onBlur: (value: string, e: React.FocusEvent<HTMLInputElement>) => void
  value?: string
}

function DateInput({ value, onBlur, ...props }: DateFieldProps) {
  const [date, setDate] = useState<string>(value ?? '')

  return (
    <DateFieldComponent
      {...props}
      value={date}
      onBlur={(e) => {
        const segmentType = String(e.target.id.split('-').pop())
        const val = e.target.value
        const dateSegmentVals = date.split('-')

        // Add possibly missing leading 0 for days and months
        if (segmentType === 'dd' && val.length === 1) {
          setDate(`${dateSegmentVals[0]}-${dateSegmentVals[1]}-0${val}`)
        }

        if (segmentType === 'mm' && val.length === 1) {
          setDate(`${dateSegmentVals[0]}-0${val}-${dateSegmentVals[2]}`)
        }

        return onBlur(date, e)
      }}
      onChange={setDate}
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
