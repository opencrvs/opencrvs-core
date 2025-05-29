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
import { NameFieldUpdateValue, NameFieldValue } from '@opencrvs/commons/client'
import { joinValues } from '@client/v2-events/utils'
import { Text } from '@client/v2-events/features/events/registered-fields'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'

interface Props {
  onChange: (newValue: NameFieldValue) => void
  value?: NameFieldUpdateValue
  validator?: any
}

function getFields(validator: any) {
  return [
    {
      id: 'firstname',
      type: 'TEXT' as const,
      configuration: { maxLength: 32 },
      required: true,
      validator,
      label: {
        defaultMessage: 'First name',
        description: 'This is the label for the field',
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.firstname.label'
      }
    },
    {
      id: 'surname',
      type: 'TEXT' as const,
      configuration: { maxLength: 32 },
      required: true,
      validator,
      label: {
        defaultMessage: 'Surname',
        description: 'This is the label for the field',
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.surname.label'
      }
    }
  ]
}

function NameInput(props: Props) {
  const intl = useIntl()
  const { onChange, value } = props
  const firstname = value?.firstname ?? ''
  const surname = value?.surname ?? ''

  return (
    <FormFieldGenerator
      fields={getFields(props.validator)}
      id={'asdsdsad'}
      initialValues={{ ...value }}
      onChange={(values) => onChange(values as any)}
    />
  )
}

export const Name = {
  Input: NameInput,
  Output: ({ value }: { value?: NameFieldValue }) => (
    <>{joinValues([value?.firstname, value?.surname])}</>
  )
}
