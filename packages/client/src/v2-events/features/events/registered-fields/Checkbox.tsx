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
import { Checkbox as CheckboxComponent } from '@opencrvs/components'
import { FieldProps, CheckboxFieldValue } from '@opencrvs/commons/client'

export function Checkbox({
  setFieldValue,
  label,
  value,
  ...props
}: FieldProps<'CHECKBOX'> & {
  setFieldValue: (name: string, val: CheckboxFieldValue | undefined) => void
  value?: CheckboxFieldValue
}) {
  const intl = useIntl()

  return (
    <CheckboxComponent
      label={intl.formatMessage(label)}
      name={props.id}
      selected={value === 'true'}
      value={value ?? 'false'}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(
          props.id,
          event.target.value === 'true' ? 'false' : 'true'
        )
      }}
    />
  )
}

export const checkboxToString = (value: CheckboxFieldValue) =>
  value === 'true' ? 'Yes' : 'No'
