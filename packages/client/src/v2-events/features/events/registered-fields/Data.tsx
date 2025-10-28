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
import React, { useEffect } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import styled from 'styled-components'
import { get } from 'lodash'
import {
  EventState,
  FieldProps,
  FieldType,
  FieldConfig,
  isFieldVisible,
  DataFieldValue,
  DataField,
  StaticDataEntry,
  EventConfig,
  getDeclarationFields,
  FieldValue,
  DataEntry,
  TranslationConfig,
  FieldReference
} from '@opencrvs/commons/client'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { makeFormikFieldIdOpenCRVSCompatible } from '@client/v2-events/components/forms/utils'

function isFieldReference(entry: unknown): entry is FieldReference {
  return (
    Boolean(entry) &&
    typeof entry === 'object' &&
    entry !== null &&
    '$$field' in entry
  )
}

function getFieldFromDataEntry({
  intl,
  formData,
  entry
}: {
  intl: IntlShape
  formData: EventState
  entry: StaticDataEntry
}) {
  const { label, value: rawValue } = entry

  // Resolve value if it's a message descriptor
  let formattedValue: string

  if (isFieldReference(rawValue)) {
    formattedValue = rawValue.$$subfield
      ? get(formData[rawValue.$$field], rawValue.$$subfield)
      : formData[rawValue.$$field]
  } else {
    formattedValue =
      typeof rawValue === 'object' &&
      'id' in rawValue &&
      'defaultMessage' in rawValue
        ? intl.formatMessage(rawValue)
        : rawValue
  }

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
      id: entry.id,
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
 * This is a read-only form field, which is used to display a collection of data, which can be either:
 *  1. static text entries
 *  2. or entries derived from main declaration form data via 'fieldId' references
 */
function DataInput({
  configuration,
  label,
  formData,
  allKnownFields,
  onChange,
  id
}: FieldProps<'DATA'> & {
  formData: EventState
  allKnownFields: FieldConfig[]
  onChange: (value: DataFieldValue) => void
}) {
  const intl = useIntl()
  const validatorContext = useValidatorContext()
  const { subtitle, data } = configuration
  const title = label.defaultMessage ? intl.formatMessage(label) : ''

  const fields = data.map((entry) => {
    if ('fieldId' in entry) {
      const config = allKnownFields.find((f) => f.id === entry.fieldId)

      if (!config) {
        throw new Error(
          `Configuration for field: '${entry.fieldId}' in DATA not found`
        )
      }

      return {
        value: formData[entry.fieldId],
        config
      }
    }

    const value = entry.value

    if (isFieldReference(value)) {
      const resolvedValue = value.$$subfield
        ? get(formData[value.$$field], value.$$subfield)
        : formData[value.$$field]

      return getFieldFromDataEntry({
        intl,
        formData,
        entry: {
          label: entry.label,
          value: resolvedValue ? String(resolvedValue) : '',
          id: entry.id
        }
      })
    }

    return getFieldFromDataEntry({
      intl,
      formData,
      entry: {
        label: entry.label,
        value,
        id: entry.id
      }
    })
  })

  // When we first render the field, let's save the values of the fields to the form data.
  // This is done because we want to send the values to the backend, so that they can be displayed in the Output later.
  useEffect(() => {
    // We keep updating until the field value is actually found in the form data.
    // Previously we tried only updating the value during render once, but ran into issues with form state not being updated.
    const idWithDotSeparator = makeFormikFieldIdOpenCRVSCompatible(id)
    if (idWithDotSeparator in formData) {
      return
    }

    const value = fields.reduce((acc, f) => {
      if (f.value === null || f.value === undefined) {
        return acc
      }

      return { ...acc, [f.config.id]: f.value }
    }, {})

    onChange(value)
  }, [id, formData, onChange, fields])

  return (
    <Container>
      {title && <label>{title}</label>}
      {subtitle && <Subtitle>{intl.formatMessage(subtitle)}</Subtitle>}
      <dl>
        {fields
          // We don't want to display fields that are conditionally hidden in the original form configuration
          .filter(({ config }) =>
            isFieldVisible(config, formData, validatorContext)
          )
          .map(({ config, value }) => (
            <React.Fragment key={config.id}>
              <dt>{intl.formatMessage(config.label)}</dt>
              <dd>
                <Output field={config} value={value} />
              </dd>
            </React.Fragment>
          ))}
      </dl>
    </Container>
  )
}

/*
 * Data entries can either be static string entries, or references to other fields.
 * If we are handling a reference field, we generate the <Output/> component for the reference field.
 */
function getDataOutputEntry(
  value: NonNullable<DataFieldValue>,
  dataEntryConfig: DataEntry,
  declarationFields: FieldConfig[]
) {
  if ('id' in dataEntryConfig) {
    const { id, label } = dataEntryConfig

    if (!Boolean(value[id])) {
      return null
    }

    return {
      id,
      label,
      valueDisplay: (
        <Output field={{ type: FieldType.TEXT, id, label }} value={value[id]} />
      )
    }
  }

  const { fieldId } = dataEntryConfig

  if (!Boolean(value[fieldId])) {
    return null
  }

  const referencedFieldConfig = declarationFields.find((f) => f.id === fieldId)

  if (!referencedFieldConfig) {
    return null
  }

  return {
    id: fieldId,
    label: referencedFieldConfig.label,
    valueDisplay: (
      <Output field={referencedFieldConfig} value={value[fieldId]} />
    )
  }
}

/**
 * Output for FieldType.DATA fields will return a fragment which contains rows of data entries.
 */
function DataOutput({
  value,
  field,
  eventConfig
}: {
  value: DataFieldValue
  field: DataField
  eventConfig: EventConfig
}) {
  const intl = useIntl()

  if (!value) {
    return null
  }

  const declarationFields = getDeclarationFields(eventConfig)
  const entries = field.configuration.data
    .map((d) => getDataOutputEntry(value, d, declarationFields))
    .filter((e) => e !== null)

  if (!entries.length) {
    return null
  }

  return (
    <>
      {entries.map(({ label, valueDisplay, id }) => (
        <div key={`${field.id}-${id}`}>
          <b>
            {intl.formatMessage(label)}
            {': '}
          </b>
          {valueDisplay}
        </div>
      ))}
    </>
  )
}

export const Data = {
  Input: DataInput,
  Output: DataOutput
}
