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
  FieldType,
  NameField
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
  const user = systemVariables.user
  const field = defaultValue.$userField
  return user[field] // e.g., user('role'), user('fullHonorificName'), etc.
}

function handleDefaultValueForNameField({
  field,
  systemVariables
}: {
  field: NameField
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (!defaultValue) {
    return undefined
  }

  const resolvePart = (value?: string | SerializedUserField): string => {
    if (!value) {
      return ''
    }

    if (typeof value === 'string') {
      return value
    }

    if (isSerializedUserField(value)) {
      const resolved = resolveUserFieldDefault(value, systemVariables)
      return typeof resolved === 'string' ? resolved : ''
    }

    return ''
  }

  return {
    firstname: resolvePart(defaultValue.firstname),
    middlename: resolvePart(defaultValue.middlename),
    surname: resolvePart(defaultValue.surname)
  }
}

export function handleDefaultValue({
  field,
  systemVariables
}: {
  field: InteractiveFieldType
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

  if (field.type === FieldType.NAME) {
    return handleDefaultValueForNameField({
      field,
      systemVariables
    })
  }

  if (isSerializedUserField(defaultValue)) {
    return resolveUserFieldDefault(defaultValue, systemVariables)
  }

  if (isFieldConfigDefaultValue(defaultValue)) {
    return replacePlaceholders({
      field,
      defaultValue
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
