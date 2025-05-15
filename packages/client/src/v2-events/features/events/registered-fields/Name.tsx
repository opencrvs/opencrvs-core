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
  FieldProps,
  FieldType,
  NameFieldUpdateValue,
  NameFieldValue
} from '@opencrvs/commons/client'
import { joinValues } from '@client/v2-events/utils'
import { Text } from '@client/v2-events/features/events/registered-fields'

type Props = FieldProps<typeof FieldType.NAME> & {
  onChange: (newValue: NameFieldValue) => void
  value?: NameFieldUpdateValue
}

function NameInput(props: Props) {
  const { onChange, value } = props
  const firstname = value?.firstname ?? ''
  const surname = value?.surname ?? ''

  return (
    <>
      <Text.Input
        type={'text'}
        value={firstname}
        onChange={(val) => val && onChange({ firstname: val, surname })}
      />

      <Text.Input
        type={'text'}
        value={surname}
        onChange={(val) => val && onChange({ firstname, surname: val })}
      />
    </>
  )
}

export const Name = {
  Input: NameInput,
  Output: ({ value }: { value?: NameFieldValue }) => (
    <>{joinValues([value?.firstname, value?.surname])}</>
  )
}
