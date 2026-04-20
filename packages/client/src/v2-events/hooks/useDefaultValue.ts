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
import { useSelector } from 'react-redux'
import { get } from 'lodash'
import {
  FieldConfig,
  SystemVariables,
  SerializedUserField,
  isNonInteractiveFieldType,
  FieldType,
  FieldValue,
  EventState,
  buildFormState,
  UUID,
  AdministrativeArea,
  FieldGroup,
  TextField,
  FieldConfigDefaultValue,
  isFieldValueWithoutTemplates,
  isTemplateVariable,
  mapFieldTypeToZod,
  compositeFieldTypes
} from '@opencrvs/commons/client'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { useSystemVariables } from './useSystemVariables'
import { useAdministrativeAreas } from './useAdministrativeAreas'

interface Context extends SystemVariables {
  administrativeAreas: Map<UUID, AdministrativeArea>
  adminLevelIds: string[]
}

type FieldsWithDefaultValue = Extract<FieldConfig, { defaultValue?: unknown }> | FieldGroup

function isTextField(field: FieldConfig): field is TextField {
  return field.type === FieldType.TEXT
}

/**
 *
 * @param fieldType: The type of the field.
 * @param currentValue: The current value of the field.
 * @param defaultValue: Configured default value from the country configuration.
 * @param meta: Metadata fields such as '$user', '$event', and others.
 *
 * @returns Resolves template variables in the default value and returns the resolved value.
 */
export function replacePlaceholders({
  field,
  currentValue,
  defaultValue,
  systemVariables
}: {
  field: FieldsWithDefaultValue
  currentValue?: FieldValue
  defaultValue?: FieldConfigDefaultValue
  systemVariables: SystemVariables
}): FieldValue | undefined {
  if (currentValue) {
    return currentValue
  }

  if (!defaultValue) {
    return undefined
  }

  if (isFieldValueWithoutTemplates(defaultValue)) {
    return defaultValue
  }

  if (isTemplateVariable(defaultValue)) {
    const resolvedValue = get(systemVariables, defaultValue)
    const validator = mapFieldTypeToZod(field)

    const parsedValue = validator.safeParse(resolvedValue)

    if (parsedValue.success) {
      return parsedValue.data as FieldValue
    }

    throw new Error(`Could not resolve ${defaultValue}: ${parsedValue.error}`)
  }

  if (
    compositeFieldTypes.some((ft) => ft === field.type) &&
    typeof defaultValue === 'object'
  ) {
    /**
     * defaultValue is typically an ADDRESS, FILE, or FILE_WITH_OPTIONS.
     * Some STRING values within the defaultValue object may contain template variables (prefixed with $).
     */
    const result = { ...defaultValue }

    // @TODO: This resolves template variables in the first level of the object. In the future, we might need to extend it to arbitrary depth.
    for (const [key, val] of Object.entries(result)) {
      if (val && isTemplateVariable(val) && isTextField(field)) {
        const resolvedValue = get(systemVariables, val)
        // For now, we only support resolving template variables for text fields.
        const validator = mapFieldTypeToZod(field)
        const parsedValue = validator.safeParse(resolvedValue)
        if (parsedValue.success && parsedValue.data) {
          result[key] = resolvedValue
        } else {
          throw new Error(`Could not resolve ${key}: ${parsedValue.error}`)
        }
      }
    }

    const resultValidator = mapFieldTypeToZod(field)
    const parsedResult = resultValidator.safeParse(result)
    if (parsedResult.success) {
      return result as FieldValue
    }
    throw new Error(
      `Could not resolve ${field.type}: ${JSON.stringify(
        defaultValue
      )}. Error: ${parsedResult.error}`
    )
  }
  throw new Error(
    `Could not resolve ${field.type}: ${JSON.stringify(defaultValue)}`
  )
}


function isSerializedUserField(value: unknown): value is SerializedUserField {
  return !!value && typeof value === 'object' && '$userField' in value
}

function resolveSerializedUserField(
  value: string | SerializedUserField | undefined,
  context: Context
): string {
  if (!value) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (value.$location) {
    if (value.$userField !== 'primaryOfficeId' && value.$userField !== 'administrativeAreaId') {
      return ''
    }
    const locationId = context.user.administrativeAreaId
    const hierarchy = getAdminLevelHierarchy(
      locationId,
      context.administrativeAreas,
      context.adminLevelIds
    )

    return hierarchy[value.$location] ?? ''
  }
  return context.user[value.$userField] ?? ''
}

export function mapFieldToDefaultValue(
  field: FieldsWithDefaultValue,
  context: Context
): FieldValue | undefined {
  if (field.type === FieldType.FIELD_GROUP) {
    return buildFormState(field.fields, (subfield) => {
      if (isNonInteractiveFieldType(subfield)) {
        return
      }
      return mapFieldToDefaultValue(subfield, context)
    })
  }
  if (field.defaultValue === undefined) {
    return
  }
  switch (field.type) {
    case FieldType.NAME: {
      return {
        firstname: resolveSerializedUserField(
          field.defaultValue.firstname,
          context
        ),
        middlename: resolveSerializedUserField(
          field.defaultValue.middlename,
          context
        ),
        surname: resolveSerializedUserField(field.defaultValue.surname, context)
      }
    }
    case FieldType.ADDRESS: {
      return {
        ...field.defaultValue,
        administrativeArea: resolveSerializedUserField(
          field.defaultValue.administrativeArea,
          context
        )
      }
    }
    case FieldType.DATE: {
      if (typeof field.defaultValue === 'string') {
        return field.defaultValue
      }
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }
    case FieldType.TIME: {
      if (typeof field.defaultValue === 'string') {
        return field.defaultValue
      }
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      return `${hours}:${minutes}`
    }
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
    case FieldType.LOCATION:
    case FieldType.SELECT:
    case FieldType.COUNTRY:
    case FieldType.RADIO_GROUP:
    case FieldType.ADMINISTRATIVE_AREA:
    case FieldType.FACILITY:
    case FieldType.ALPHA_HIDDEN:
    case FieldType.OFFICE:
    case FieldType.NUMBER:
    case FieldType.NUMBER_WITH_UNIT:
    case FieldType.EMAIL:
    case FieldType.AGE:
    case FieldType._EXPERIMENTAL_CUSTOM:
    case FieldType.USER_ROLE:
    case FieldType.CHECKBOX:
    case FieldType.DATE_RANGE:
    case FieldType.SELECT_DATE_RANGE:
    case FieldType.PHONE:
    case FieldType.BUTTON:
    case FieldType.SEARCH:
    case FieldType.ID:
    case FieldType.VERIFICATION_STATUS:
    case FieldType.QR_READER:
    case FieldType.IMAGE_VIEW:
    case FieldType.HTTP:
    case FieldType.ID_READER:
    case FieldType.SIGNATURE:
    case FieldType.FILE:
    case FieldType.FILE_WITH_OPTIONS:
      const defaultValue = field.defaultValue

      if (isSerializedUserField(defaultValue)) {
        return resolveSerializedUserField(defaultValue, context)
      }

      return replacePlaceholders({
        field,
        defaultValue,
        systemVariables: context
      })
  }
}

export function useDefaultValue() {
  const systemVariables = useSystemVariables()
  const { config } = useSelector(getOfflineData)
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const adminLevelIds = useMemo(
    () => config.ADMIN_STRUCTURE.map((level) => level.id),
    [config.ADMIN_STRUCTURE]
  )
  function getDefaultValue(field: FieldConfig): FieldValue | undefined
  function getDefaultValue(fields: FieldConfig[]): EventState
  function getDefaultValue(
    fieldOrFields: FieldConfig | FieldConfig[]
  ): FieldValue | EventState | undefined {
    if (Array.isArray(fieldOrFields)) {
      const fields = fieldOrFields
      return buildFormState(fields, (field) => getDefaultValue(field))
    }
    const field = fieldOrFields
    if (isNonInteractiveFieldType(field)) {
      return
    }
    return mapFieldToDefaultValue(field, {
      ...systemVariables,
      administrativeAreas,
      adminLevelIds
    })
  }
  return getDefaultValue
}
