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
import { InputField, TextInput, useFormContext } from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons'
import { useIntl } from 'react-intl'

export const TextField = ({ id, label }: FieldProps<'TEXT'>) => {
  const intl = useIntl()
  const { register } = useFormContext()

  return (
    <InputField id={id} touched={false} label={intl.formatMessage(label)}>
      <TextInput type="text" {...register(id)} />
    </InputField>
  )
}
