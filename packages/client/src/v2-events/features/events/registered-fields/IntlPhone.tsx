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

import * as React from 'react'
import {
  IIntlPhoneFieldProps,
  IntlPhoneField as IntlPhoneFieldComponent
} from '@opencrvs/components'

interface PhoneFieldProps
  extends Omit<IIntlPhoneFieldProps, 'onChange' | 'value'> {
  onChange(val: string | undefined): void
  value: string | undefined
}

function IntlPhoneField({
  value,
  disabled,
  type,
  country,
  options,
  onChange,
  ...props
}: PhoneFieldProps) {
  const [FieldValue, setFieldValue] = React.useState<string>(value ?? '')

  React.useEffect(() => {
    setFieldValue(value ?? '')
  }, [value])

  const handleChange = React.useCallback(
    (val: string) => {
      onChange(val)
    },
    [onChange]
  )

  return (
    <IntlPhoneFieldComponent
      {...props}
      country={country}
      data-testid={`text__${props.id}`}
      disabled={disabled}
      options={options}
      value={FieldValue}
      onChange={handleChange}
    />
  )
}

export const IntlPhone = {
  Input: IntlPhoneField,
  Output: ({ value }: { value?: string }) => <>{value?.toString() || ''}</>
}
