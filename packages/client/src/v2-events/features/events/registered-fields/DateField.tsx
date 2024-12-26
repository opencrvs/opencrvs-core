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
import React from 'react'
import { useIntl } from 'react-intl'
import { useController } from 'react-hook-form'
import {
  InputField,
  DateField as DateFieldComponent
} from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons'
import { IFormFieldValue } from '@client/forms'

export const INITIAL_DATE_VALUE = null

export function DateField({
  id,
  label,
  options = {},
  required
}: FieldProps<'DATE'>) {
  const intl = useIntl()
  const {
    field,
    fieldState: { isTouched, error }
  } = useController({
    name: id,
    rules: { required: '[not i18n yet..]: This field is required' }
  })

  return (
    <InputField
      error={error?.message}
      id={id}
      label={intl.formatMessage(label)}
      touched={isTouched}
    >
      <DateFieldComponent
        id={id}
        notice={options.notice && intl.formatMessage(options.notice)}
        value={field.value}
        onBlur={field.onBlur}
        onChange={(val) => field.onChange(val)}
      />
    </InputField>
  )
}

export const dateToString = (date: IFormFieldValue | undefined | null) => {
  if (!date) {
    return ''
  }
  if (typeof date === 'string') {
    return date
  }
  return (date as Date).toISOString().split('T')[0]
}
