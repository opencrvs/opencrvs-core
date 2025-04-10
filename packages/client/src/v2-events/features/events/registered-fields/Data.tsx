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
  DataEntry,
  EventState,
  FieldProps,
  FieldType,
  FieldValue,
  Inferred,
  isFieldVisible
} from '@opencrvs/commons/client'
import { Output } from '@client/v2-events/features/events/components/Output'

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 17px 20px 10px;
  border-radius: 5px;

  label {
    ${({ theme }) => theme.fonts.h3};
    margin-bottom: 0.3rem;
    display: block;
  }

  dt {
    ${({ theme }) => theme.fonts.bold16};
    display: block;
    margin-bottom: 0.4rem;
  }

  dd {
    margin: 0 0 1.5rem;
  }
`

const Subtitle = styled.div`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey500};
  margin: 0 0 2rem;
`

/**
 * This is a read-only form field, that is used to display a collection of form fields from the main 'declaration' form data.
 */
function DataInput({
  configuration,
  label,
  fields,
  formData
}: FieldProps<'DATA'> & {
  // Unfortunately we need to include the field config in the field object, since it is required by <Output />
  fields: { value: FieldValue; config?: Inferred }[]
  formData: EventState
}) {
  const intl = useIntl()
  const { data, subtitle } = configuration
  const title = label.defaultMessage ? intl.formatMessage(label) : ''

  return (
    <Container>
      {title && <label>{title}</label>}
      {subtitle && <Subtitle>{intl.formatMessage(subtitle)}</Subtitle>}
      <dl>
        {data.map((dataEntry) => {
          const fieldId =
            'fieldId' in dataEntry ? dataEntry.fieldId : dataEntry.label.id
          const field = fields.find((f) => f.config?.id === fieldId)

          if (
            !field ||
            !field.config ||
            // We don't want to display fields that are conditionally hidden in the original form configuration
            !isFieldVisible(field.config, formData)
          ) {
            return null
          }

          return (
            <React.Fragment key={field.config.id}>
              <dt>{intl.formatMessage(field.config.label)}</dt>
              <dd>
                <Output
                  field={field.config}
                  showPreviouslyMissingValuesAsChanged={false}
                  value={field.value}
                />
              </dd>
            </React.Fragment>
          )
        })}
      </dl>
    </Container>
  )
}

export const Data = {
  Input: DataInput,
  Output: null
}

export function getFieldFromDataEntry(
  formData: EventState,
  dataEntry: DataEntry,
  declarationFields: Inferred[]
): { value: FieldValue; config?: Inferred } {
  if ('fieldId' in dataEntry) {
    return {
      value: formData[dataEntry.fieldId],
      config: declarationFields.find((f) => f.id === dataEntry.fieldId)
    }
  }
  const { value, label } = dataEntry
  const template = value
  let resolvedValue = value
  const keys = template.match(/{([^}]+)}/g)
  if (keys) {
    keys.forEach((key) => {
      const val = formData[key.replace(/{|}/g, '')]
      if (!val) {
        throw new Error(`Could not resolve ${key}`)
      }
      resolvedValue = resolvedValue.replace(key, val.toString())
    })
  }

  return {
    value: resolvedValue,
    config: {
      type: FieldType.TEXT,
      id: label.id,
      label: label
    }
  }
}
