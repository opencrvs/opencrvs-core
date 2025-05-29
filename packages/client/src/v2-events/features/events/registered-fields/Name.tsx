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
  FieldConfig,
  FieldType,
  getValidatorsForField,
  JSONSchema,
  NameFieldValue
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { joinValues } from '@client/v2-events/utils'

interface Props {
  onChange: (newValue: NameFieldValue) => void
  validation: FieldConfig['validation']
  value?: NameFieldValue
}

function NameInput(props: Props) {
  const { onChange, value = {} } = props
  const validators = props.validation || []

  const fields = [
    {
      id: 'firstname',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'v2.field.name.firstname.label'
      },
      validation: getValidatorsForField('firstname', validators)
    },
    {
      id: 'surname',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'v2.field.name.surname.label'
      },
      validation: getValidatorsForField('surname', validators)
    }
  ]

  return (
    <FormFieldGenerator
      fields={fields}
      id="sdf"
      initialValues={{ ...value }}
      onChange={(values) => onChange(values as NameFieldValue)}
    />
  )
}

export const Name = {
  Input: NameInput,
  Output: ({ value }: { value?: NameFieldValue }) => (
    <>{joinValues([value?.firstname, value?.surname])}</>
  )
}
