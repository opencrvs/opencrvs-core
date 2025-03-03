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
import { v4 as uuid } from 'uuid'
import { uniq, isString, get, mapKeys } from 'lodash'

import { IntlShape } from 'react-intl'
import {
  ResolvedUser,
  ActionDocument,
  EventConfig,
  EventIndex,
  WorkqueueConfig,
  getAllFields
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

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}

export function createTemporaryId() {
  return `tmp-${uuid()}`
}

export function flattenEventIndex(
  event: EventIndex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Omit<EventIndex, 'data'> & { [key: string]: any } {
  const { data, ...rest } = event
  return { ...rest, ...mapKeys(data, (_, key) => `${key}`) }
}

export function getFieldsWithPopulatedValues({
  workqueue,
  intl,
  eventConfig,
  event
}: {
  event: EventIndex
  workqueue: WorkqueueConfig
  intl: IntlShape
  eventConfig: EventConfig
}): Record<string, string> {
  const allPropertiesWithEmptyValues = setEmptyValuesForFields(
    getAllFields(eventConfig)
  )

  return workqueue.fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.column]: intl.formatMessage(field.label, {
        ...allPropertiesWithEmptyValues,
        ...flattenEventIndex(event)
      })
    }),
    {}
  )
}

export function getEventTitle({
  event,
  eventConfig,
  workqueue: wq,
  intl,
  titleColumn
}: {
  event: EventIndex
  eventConfig: EventConfig
  workqueue?: WorkqueueConfig
  intl: IntlShape
  titleColumn?: string
}): string {
  const workqueue = wq ?? eventConfig.workqueues[0]
  const fieldsWithPopulatedValues = getFieldsWithPopulatedValues({
    workqueue,
    intl,
    eventConfig,
    event
  })

  return (
    (titleColumn && fieldsWithPopulatedValues[titleColumn]) ??
    intl.formatMessage(
      eventConfig.summary.title.label,
      flattenEventIndex(event)
    )
  )
}

export type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
