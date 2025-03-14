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
import _, { uniq, isString, get, mapKeys } from 'lodash'

import { IntlShape } from 'react-intl'
import { v4 as uuid } from 'uuid'
import {
  ResolvedUser,
  ActionDocument,
  EventConfig,
  EventIndex,
  getAllFields,
  FieldValue,
  FieldType,
  DefaultValue,
  MetaFields,
  isTemplateVariable,
  mapFieldTypeToZod,
  isFieldValueWithoutTemplates
} from '@opencrvs/commons/client'
import { setEmptyValuesForFields } from './components/forms/utils'

/**
 *
 * Joins defined values using a separator and trims the result
 */
export function joinValues(
  values: Array<string | undefined | null>,
  separator = ' '
) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

export function getUsersFullName(
  names: ResolvedUser['name'],
  language: string
) {
  const match = names.find((name) => name.use === language) ?? names[0]

  return joinValues([...match.given, match.family])
}

/** Utility to get all keys from union */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AllKeys<T> = T extends T ? keyof T : never

/**
 * @returns unique ids of users are referenced in the ActionDocument array.
 * Used for fetching user data in bulk.
 */
export const getUserIdsFromActions = (actions: ActionDocument[]) => {
  const userIdFields = [
    'createdBy',
    'assignedTo'
  ] satisfies AllKeys<ActionDocument>[]

  const userIds = actions.flatMap((action) =>
    userIdFields.map((fieldName) => get(action, fieldName)).filter(isString)
  )

  return uniq(userIds)
}

export const getAllUniqueFields = (currentEvent: EventConfig) => {
  return [
    ...new Map(
      currentEvent.actions.flatMap((action) =>
        action.forms.flatMap((form) =>
          form.pages.flatMap((page) =>
            page.fields.map((field) => [field.id, field])
          )
        )
      )
    ).values()
  ]
}

export function flattenEventIndex(
  event: EventIndex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Omit<EventIndex, 'data'> & { [key: string]: any } {
  const { data, ...rest } = event
  return { ...rest, ...mapKeys(data, (_, key) => `${key}`) }
}

export function getEventTitle({
  event,
  eventConfig,
  intl
}: {
  event: EventIndex
  eventConfig: EventConfig
  intl: IntlShape
}): string {
  const allPropertiesWithEmptyValues = setEmptyValuesForFields(
    getAllFields(eventConfig)
  )

  return intl.formatMessage(eventConfig.summary.title.label, {
    ...allPropertiesWithEmptyValues,
    ...flattenEventIndex(event)
  })
}

export type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}

export function createTemporaryId() {
  return `tmp-${uuid()}`
}

/**
 *
 * currentValue: The current value of the field.
 * defaultValue: Configured default value from the country configuration.
 * meta: Metadata fields such as 'user', 'event', and others.
 */

export function replacePlaceholders({
  fieldType,
  currentValue,
  defaultValue,
  meta
}: {
  fieldType: FieldType
  currentValue?: FieldValue
  defaultValue?: DefaultValue
  meta: MetaFields
}): FieldValue | undefined {
  if (currentValue) {
    return currentValue
  }

  if (!defaultValue) {
    return undefined
  }

  if (isTemplateVariable(defaultValue)) {
    const resolvedValue = _.get(meta, defaultValue)
    const validator = mapFieldTypeToZod(fieldType)

    const parsedValue = validator.safeParse(resolvedValue)

    if (parsedValue.success) {
      return parsedValue.data
    }
    throw new Error(`Could not resolve ${defaultValue}: ${parsedValue.error}`)
  }

  if (isFieldValueWithoutTemplates(defaultValue)) {
    return defaultValue
  }

  const compositeFieldTypes = [
    FieldType.ADDRESS,
    FieldType.FILE,
    FieldType.FILE_WITH_OPTIONS
  ]
  if (
    compositeFieldTypes.some((ft) => ft === fieldType) &&
    typeof defaultValue === 'object'
  ) {
    /**
     * defaultValue is typically an ADDRESS, FILE, or FILE_WITH_OPTIONS.
     * Some STRING values within the defaultValue object may contain template variables (prefixed with $).
     */
    const result = { ...defaultValue }

    for (const [key, val] of _.toPairs(result)) {
      if (isTemplateVariable(val)) {
        const resolvedValue = _.get(meta, val)
        const validator = mapFieldTypeToZod(FieldType.TEXT)
        const parsedValue = validator.safeParse(resolvedValue)
        if (parsedValue.success && parsedValue.data) {
          result[key] = parsedValue.data
        } else {
          throw new Error(`Could not resolve ${key}: ${parsedValue.error}`)
        }
      }
    }

    const resultValidator = mapFieldTypeToZod(fieldType)
    const parsedResult = resultValidator.safeParse(result)
    if (parsedResult.success) {
      return parsedResult.data
    }
    throw new Error(
      `Could not resolve ${fieldType}: ${JSON.stringify(
        defaultValue
      )}. Error: ${parsedResult.error}`
    )
  }
  throw new Error(
    `Could not resolve ${fieldType}: ${JSON.stringify(defaultValue)}`
  )
}
