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
import styled from 'styled-components'
import {
  FieldProps,
  ActionType,
  findActiveActionFormFields,
  FieldValue
} from '@opencrvs/commons/client'
import { useCurrentEventContext } from '@client/v2-events/features/events/components/Action'
import { Output } from '@client/v2-events/features/events/components/Output'

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 17px 20px 10px;
  border-radius: 5px;

  h4 {
    ${({ theme }) => theme.fonts.bold18};
    margin: 0 0 0.3rem;
  }

  h5 {
    ${({ theme }) => theme.fonts.reg16};
    color: ${({ theme }) => theme.colors.grey500};
    margin: 0 0 2rem;
  }

  label {
    ${({ theme }) => theme.fonts.bold16};
    display: block;
    margin-bottom: 0.4rem;
  }

  p {
    margin: 0 0 1.5rem;
  }
`

function DataInput({
  configuration,
  value
}: FieldProps<'DATA'> & { value: Record<string, FieldValue> }) {
  const intl = useIntl()
  const { config } = useCurrentEventContext()

  if (!config) {
    throw new Error('Event configuration not found')
  }

  const declareFormFields = findActiveActionFormFields(
    config,
    ActionType.DECLARE
  )

  if (!declareFormFields) {
    throw new Error('Declare form fields not found')
  }

  const { title, data, subtitle } = configuration

  return (
    <Container>
      {title && <h4>{intl.formatMessage(title)}</h4>}
      {subtitle && <h5>{intl.formatMessage(subtitle)}</h5>}
      <div>
        {data.map((item) => {
          const field = declareFormFields.find((f) => f.id === item.fieldId)

          return (
            field && (
              <div key={item.fieldId}>
                <label>{intl.formatMessage(field.label)}</label>
                <p>
                  <Output
                    field={field}
                    showPreviouslyMissingValuesAsChanged={false}
                    value={value[item.fieldId]}
                  />
                </p>
              </div>
            )
          )
        })}
      </div>
    </Container>
  )
}

export const Data = {
  Input: DataInput,
  Output: null
}
