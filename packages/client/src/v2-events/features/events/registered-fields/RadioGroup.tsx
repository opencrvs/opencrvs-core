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

export const RadioGroup = ({ id, options }: FieldProps<'RADIO_GROUP'>) => {
  const { setValue, watch } = useFormContext()
  const value = watch(id)

  return (
    <InputField id={id} touched={false}>
      <RadioGroupComponent
        options={options}
        name={id}
        onChange={(val) => setValue(id, val)}
        value={value}
      />
    </InputField>
  )
}
