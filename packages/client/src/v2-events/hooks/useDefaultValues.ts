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
import { useMemo } from 'react'
import {
  FieldConfig,
  SystemVariables,
  isFieldConfigDefaultValue,
  InteractiveFieldType,
  SerializedUserField,
  isNonInteractiveFieldType,
  FieldType
} from '@opencrvs/commons/client'
import { replacePlaceholders } from '@client/v2-events/utils'
import { useSystemVariables } from './useSystemVariables'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSerializedUserField(value: any): value is SerializedUserField {
  return !!value && typeof value === 'object' && '$userField' in value
}

function resolveUserFieldDefault(
  defaultValue: SerializedUserField,
  systemVariables: SystemVariables
) {
  const user = systemVariables.$user
  const field = defaultValue.$userField
  return user[field] // e.g., user('role'), user('fullHonorificName'), etc.
}

export function handleDefaultValueForNameField({
  field,
  systemVariables
}: {
  field: InteractiveFieldType
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (
    isSerializedUserField(defaultValue) &&
    defaultValue.$userField === 'name'
  ) {
    const resolvedValue = resolveUserFieldDefault(defaultValue, systemVariables)

    // If the resolved value is a string, we assume it's a full name and split it
    if (typeof resolvedValue === 'string') {
      const nameParts = resolvedValue.split(' ')

      return {
        firstname: nameParts[0] || '',
        middlename: nameParts.length === 3 ? nameParts[1] : '',
        surname: nameParts.length >= 2 ? nameParts[nameParts.length - 1] : ''
        // [`${field.id}.firstname`]: nameParts[0] || '',
        // [`${field.id}.middlename`]: nameParts.length === 3 ? nameParts[1] : '',
        // [`${field.id}.surname`]:
        //   nameParts.length >= 2 ? nameParts[nameParts.length - 1] : ''
      }
    }

    // If it's not a string, return empty name parts
    return {
      firstname: '',
      middlename: '',
      surname: ''
      // [`${field.id}.firstname`]: '',
      // [`${field.id}.middlename`]: '',
      // [`${field.id}.surname`]: ''
    }
  }

  return undefined
}

export function handleDefaultValue({
  field,
  systemVariables
}: {
  field: InteractiveFieldType
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (isSerializedUserField(defaultValue)) {
    if (field.type === FieldType.NAME) {
      return handleDefaultValueForNameField({
        field,
        systemVariables
      })
    }

    return resolveUserFieldDefault(defaultValue, systemVariables)
  }

  if (isFieldConfigDefaultValue(defaultValue)) {
    return replacePlaceholders({
      field,
      defaultValue,
      systemVariables
    })
  }

  return defaultValue
}

function getDefaultValuesForFields(
  fields: FieldConfig[],
  systemVariables: SystemVariables
) {
  return fields
    .filter(
      (field): field is InteractiveFieldType =>
        !isNonInteractiveFieldType(field)
    )
    .reduce((memo, field) => {
      const fieldInitialValue = handleDefaultValue({
        field,
        systemVariables
      })

      return { ...memo, [field.id]: fieldInitialValue }
    }, {})
}

export function useDefaultValues(fields: FieldConfig[]) {
  const systemVariables = useSystemVariables()

  return useMemo(
    () => getDefaultValuesForFields(fields, systemVariables),
    [fields, systemVariables]
  )
}
