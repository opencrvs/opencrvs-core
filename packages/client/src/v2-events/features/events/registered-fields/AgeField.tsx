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
import { useFormikContext } from 'formik'
import styled from 'styled-components'
import { defineMessage, useIntl } from 'react-intl'
import { AgeValue, DateValue, EventState } from '@opencrvs/commons/client'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { formatDate } from '@client/v2-events/messages/utils'
import { Number, NumberInputProps } from './Number'

interface AgeInputProps extends Omit<NumberInputProps, 'min' | 'onChange'> {
  asOfDateRef: string
  onChange(val: AgeValue | undefined): void
}

function AgeInput({ asOfDateRef, ...props }: AgeInputProps) {
  const { values } = useFormikContext<EventState>()

  const asOfDate = DateValue.safeParse(
    values[makeFormFieldIdFormikCompatible(asOfDateRef)]
  ).data

  return (
    <Number.Input
      {...props}
      data-testid={`age__${props.id}`}
      min={0}
      onChange={(newAge) =>
        props.onChange(
          newAge === undefined ? undefined : { age: newAge, asOfDate }
        )
      }
    />
  )
}

const AsOfLabel = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  font-style: italic;
`

const asOfMessage = defineMessage({
  defaultMessage: 'as of',
  id: 'field.age.asOf',
  description: 'Label for age as of date'
})

function AgeOutput({ value }: { value?: AgeValue }) {
  const intl = useIntl()
  const age = value?.age ?? ''
  if (!value?.asOfDate) {
    return age
  }

  return (
    <>
      <span>{age}</span>{' '}
      <AsOfLabel>
        {'('}
        {intl.formatMessage(asOfMessage)} {formatDate(intl, value.asOfDate)}
        {')'}
      </AsOfLabel>
    </>
  )
}

export const AgeField = {
  Input: AgeInput,
  Output: AgeOutput
}
