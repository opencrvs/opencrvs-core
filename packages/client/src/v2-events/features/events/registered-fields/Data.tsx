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
import { IntlShape, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  EventState,
  FieldProps,
  FieldType,
  Inferred,
  isFieldVisible,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Output } from '@client/v2-events/features/events/components/Output'

function getFieldFromDataEntry({
  intl,
  formData,
  entry
}: {
  intl: IntlShape
  formData: EventState
  entry: { value: TranslationConfig | string; label: TranslationConfig }
}) {
  const { label, value: rawValue } = entry

  // Resolve value if it's a message descriptor
  const formattedValue =
    typeof rawValue === 'object' &&
    'id' in rawValue &&
    'defaultMessage' in rawValue
      ? intl.formatMessage(rawValue)
      : rawValue

  let resolvedValue = formattedValue

  // Match placeholders like {someKey}
  const placeholders = formattedValue.match(/{([^}]+)}/g)
  if (placeholders) {
    placeholders.forEach((placeholder) => {
      const key = placeholder.replace(/{|}/g, '')
      const replacement = formData[key]

      if (replacement == null) {
        throw new Error(`Could not resolve placeholder: ${placeholder}`)
      }

      resolvedValue = resolvedValue.replace(placeholder, replacement.toString())
    })
  }

  return {
    value: resolvedValue,
    config: {
      type: FieldType.TEXT,
      id: label.id,
      label
    }
  }
}

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
  formData,
  declarationFields
}: FieldProps<'DATA'> & {
  formData: EventState
  declarationFields: Inferred[]
}) {
  const intl = useIntl()
  const { subtitle, data } = configuration
  const title = label.defaultMessage ? intl.formatMessage(label) : ''

  const fields = data.map((entry) => {
    if ('fieldId' in entry) {
      return {
        value: formData[entry.fieldId],
        config: declarationFields.find((f) => f.id === entry.fieldId)
      }
    }

    return getFieldFromDataEntry({
      intl,
      formData,
      entry
    })
  })

  return (
    <Container>
      {title && <label>{title}</label>}
      {subtitle && <Subtitle>{intl.formatMessage(subtitle)}</Subtitle>}
      <dl>
        {fields
          // We don't want to display fields that are conditionally hidden in the original form configuration
          .filter(({ config }) => config && isFieldVisible(config, formData))
          .map(({ config, value }) => {
            if (!config) {
              return null
            }

            return (
              <React.Fragment key={config.id}>
                <dt>{intl.formatMessage(config.label)}</dt>
                <dd>
                  <Output
                    field={config}
                    showPreviouslyMissingValuesAsChanged={false}
                    value={value}
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
