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
import {
  InputField,
  useFormContext,
  RadioGroup as RadioGroupComponent
} from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons'

export const RadioGroup = ({ name, options }: FieldProps<'RADIO_GROUP'>) => {
  const { setValue, watch } = useFormContext()
  const value = watch(name)

  return (
    <InputField id={name} touched={false}>
      <RadioGroupComponent
        options={options}
        name={name}
        onChange={(val) => setValue(name, val)}
        value={value}
      />
    </InputField>
  )
}
