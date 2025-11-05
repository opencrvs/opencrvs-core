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
  isNonInteractiveFieldType
} from '@opencrvs/commons/client'
import { replacePlaceholders } from '@client/v2-events/utils'
import { useSystemVariables } from './useSystemVariables'

export function handleDefaultValue({
  field,
  systemVariables
}: {
  field: InteractiveFieldType
  systemVariables: SystemVariables
}) {
  const defaultValue = field.defaultValue

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
