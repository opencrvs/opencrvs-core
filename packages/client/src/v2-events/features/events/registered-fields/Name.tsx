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
import { IntlShape } from 'react-intl'
import {
  field,
  FieldConfig,
  FieldType,
  getValidatorsForField,
  NameFieldValue,
  TextField
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { joinValues } from '@client/v2-events/utils'

interface Props {
  id: string
  onChange: (newValue: NameFieldValue) => void
  maxLength?: number
  validation: FieldConfig['validation']
  value?: NameFieldValue
}

function NameInput(props: Props) {
  const { id, onChange, value = {}, maxLength } = props
  const validators = props.validation || []

  const fields: TextField[] = [
    {
      id: 'firstname',
      type: FieldType.TEXT,
      configuration: {
        maxLength
      },
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the firstname field',
        id: 'v2.field.name.firstname.label'
      },
      validation: getValidatorsForField('firstname', validators)
    },
    {
      id: 'surname',
      type: FieldType.TEXT,
      required: true,
      configuration: {
        maxLength
      },
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the surname field',
        id: 'v2.field.name.surname.label'
      },
      validation: getValidatorsForField('surname', validators)
    }
  ] satisfies TextField[]

  return (
    <FormFieldGenerator
      fields={fields}
      id={id}
      initialValues={{ ...value }}
      onChange={(values) => onChange(values as NameFieldValue)}
    />
  )
}

function stringify(value?: NameFieldValue) {
  return joinValues([value?.firstname, value?.middlename, value?.surname])
}

export const Name = {
  Input: NameInput,
  Output: ({ value }: { value?: NameFieldValue }) => (
    <>{joinValues([value?.firstname, value?.middlename, value?.surname])}</>
  ),
  stringify
}
