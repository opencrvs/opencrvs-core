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
import {
  FieldConfig,
  SystemVariables,
  InteractiveFieldType,
  SerializedUserField,
  isNonInteractiveFieldType,
  Location,
  FieldType,
  FieldValue,
  EventState,
  buildFormState
} from '@opencrvs/commons/client'
import {
  getAdminLevelHierarchy,
  replacePlaceholders
} from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { useSystemVariables } from './useSystemVariables'
import { useLocations } from './useLocations'

interface Context extends SystemVariables {
  locations: Location[]
  adminLevelIds: string[]
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
    if (value.$userField !== 'primaryOfficeId') {
      return ''
    }
    const locationId = context.user[value.$userField]
    const hierarchy = getAdminLevelHierarchy(
      locationId,
      context.locations,
      context.adminLevelIds
    )

    return hierarchy[value.$location] ?? ''
  }
  return context.user[value.$userField] ?? ''
}

export function mapFieldToDefaultValue(
  field: InteractiveFieldType,
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
    case FieldType.OFFICE:
    case FieldType.NUMBER:
    case FieldType.NUMBER_WITH_UNIT:
    case FieldType.EMAIL:
    case FieldType.AGE:
    case FieldType.CHECKBOX:
    case FieldType.DATE_RANGE:
    case FieldType.SELECT_DATE_RANGE:
    case FieldType.PHONE:
    case FieldType.BUTTON:
    case FieldType.SEARCH:
    case FieldType.ID:
    case FieldType.VERIFICATION_STATUS:
    case FieldType.QR_READER:
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
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
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
      locations,
      adminLevelIds
    })
  }
  return getDefaultValue
}
