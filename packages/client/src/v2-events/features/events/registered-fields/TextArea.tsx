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
import { TextArea as TextAreaComponent } from '@opencrvs/components/lib/TextArea'
import { Text } from './Text'

interface TextAreaProps
  extends Omit<
    React.ComponentProps<typeof TextAreaComponent>,
    'onChange' | 'value'
  > {
  onChange(val: string): void
  value: string | undefined
}

function TextAreaInput({ value, onChange, ...props }: TextAreaProps) {
  return (
    <TextAreaComponent
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/**
 * A textarea holds the same plain string as {@link Text}, so it shares Text's
 * value semantics and only differs in how that string is entered.
 */
export const TextArea = {
  Input: TextAreaInput,
  Output: Text.Output,
  stringify: Text.stringify
}
