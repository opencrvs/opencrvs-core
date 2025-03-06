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

/* eslint-disable */
import {
  DateField as DateFieldComponent,
  IDateFieldProps as DateFieldProps
} from '@opencrvs/components/lib/DateField'
import format from 'date-fns/format'
import * as React from 'react'
import { DateValue } from '@opencrvs/commons/client'
import { defineMessages, useIntl } from 'react-intl'

const messages = defineMessages({
  dateFormat: {
    defaultMessage: 'd MMMM y',
    id: 'v2.configuration.dateFormat',
    description: 'Default format for date values'
  }
})

function DateInput({
  onChange,
  value,
  ...props
}: DateFieldProps & {
  onChange: (newValue: string) => void
  value?: string
}) {
  return (
    <DateFieldComponent {...props} value={value ?? ''} onChange={onChange} />
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
