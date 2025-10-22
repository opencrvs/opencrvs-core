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
import { Number, NumberInputProps } from './Number'

interface AgeInputProps extends Omit<NumberInputProps, 'min' | 'onChange'> {
  onChange(val: number | undefined): void
}

function AgeInput(props: AgeInputProps) {
  return (
    <Number.Input
      {...props}
      data-testid={`age__${props.id}`}
      min={0}
      onChange={props.onChange}
    />
  )
}

export const AgeField = {
  Input: AgeInput,
  Output: ({ value }: { value?: number }) => value?.toString() ?? ''
}
