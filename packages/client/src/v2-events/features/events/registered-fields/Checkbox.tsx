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
import { FieldProps } from '@opencrvs/commons/client'

function CheckboxInput({
  setFieldValue,
  label,
  value,
  ...props
}: FieldProps<'CHECKBOX'> & {
  setFieldValue: (name: string, val: boolean) => void
  value?: boolean
}) {
  const intl = useIntl()
  const inputValue = !!value ? 'true' : 'false'

  return (
    <CheckboxComponent
      label={intl.formatMessage(label)}
      name={props.id}
      selected={inputValue === 'true'}
      value={inputValue}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(props.id, event.target.value === 'true' ? false : true)
      }}
    />
  )
}

function CheckboxOutput({
  value,
  required
}: {
  value?: boolean
  required?: boolean
}) {
  // If a checkbox is required, we always show it
  if (required) {
    // We explicity check for boolean true, so that e.g. string values are not interpreted as true.
    return value === true ? 'Yes' : 'No'
  }

  // If a checkbox is not required, we only show it if it is true
  return value === true ? 'Yes' : null
}

export const Checkbox = {
  Input: CheckboxInput,
  Output: CheckboxOutput
}
