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
import { FieldPropsWithoutReferenceValue } from '@opencrvs/commons/client'
import { buttonMessages } from '@client/i18n/messages'

function CheckboxInput({
  label,
  value,
  onChange,
  ...props
}: FieldPropsWithoutReferenceValue<'CHECKBOX'> & {
  value?: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  const intl = useIntl()
  const inputValue = !!value ? 'true' : 'false'

  return (
    <CheckboxComponent
      disabled={props.disabled}
      id={props.id}
      label={intl.formatMessage(label)}
      name={props.id}
      selected={inputValue === 'true'}
      value={inputValue}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value === 'true' ? false : true)
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
  const intl = useIntl()
  return value === true
    ? intl.formatMessage(buttonMessages.yes)
    : intl.formatMessage(buttonMessages.no)
}

export const Checkbox = {
  Input: CheckboxInput,
  Output: CheckboxOutput
}
