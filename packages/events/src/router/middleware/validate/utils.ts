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

import { TRPCError } from '@trpc/server'
import _ from 'lodash'
import {
  ActionUpdate,
  Inferred,
  errorMessages,
  runFieldValidations,
  isFieldVisible,
  EventState
} from '@opencrvs/commons/events'

type ValidationError = {
  message: string
  id: string
  value: unknown
}

export function getFormFieldErrors(
  formFields: Inferred[],
  data: ActionUpdate,
  declaration: EventState = {}
) {
  const visibleFields = formFields.filter((field) =>
    isFieldVisible(field, { ...data, ...declaration })
  )

  const visibleFieldIds = visibleFields.map((field) => field.id)

  const hiddenFieldIds = formFields
    .filter(
      (field) =>
        // If field is not visible and not in the visible fields list, it is a hidden field
        // We need to check against the visible fields list because there might be fields with same ids, one of which is visible and others are hidden
        !isFieldVisible(field, data) && !visibleFieldIds.includes(field.id)
    )
    .map((field) => field.id)

  // Add errors if there are any hidden fields sent in the payloa
  const hiddenFieldErrors = hiddenFieldIds.flatMap((fieldId) => {
    if (data[fieldId as keyof typeof data]) {
      return {
        message: errorMessages.hiddenField.defaultMessage,
        id: fieldId,
        value: data[fieldId as keyof typeof data]
      }
    }

    return []
  })

  // For visible fields, run the field validations as configured
  const visibleFieldErrors = visibleFields.flatMap((field) => {
    const fieldErrors = runFieldValidations({
      field,
      values: data
    })

    return fieldErrors.errors.map((error) => ({
      message: error.message.defaultMessage,
      id: field.id,
      value: data[field.id as keyof typeof data]
    }))
  })

  return [...hiddenFieldErrors, ...visibleFieldErrors]
}

export function getVerificationPageErrors(
  verificationPageIds: string[],
  data: ActionUpdate
) {
  return verificationPageIds
    .map((pageId) => {
      const value = data[pageId]
      return typeof value !== 'boolean'
        ? {
            message: 'Verification page result is required',
            id: pageId,
            value
          }
        : null
    })
    .filter((error) => error !== null)
}

export function throwWhenNotEmpty(errors: unknown[]) {
  if (errors.length > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: JSON.stringify(errors)
    })
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return _.isPlainObject(value)
}

/**
 * Flattens an object into a list of [key, value] pairs using dot/bracket notation.
 */
function flattenEntries<T>(obj: T, path: string = ''): [string, unknown][] {
  if (Array.isArray(obj)) {
    return obj.flatMap((value, index) =>
      flattenEntries(value, `${path}[${index}]`)
    )
  }

  if (isObject(obj)) {
    return Object.entries(obj).flatMap(([key, value]) =>
      flattenEntries(value, path ? `${path}.${key}` : key)
    )
  }

  return obj === undefined ? [] : [[path, obj]]
}

/**
 * Compares update vs cleaned payloads and returns an array of offending keys.
 */
export function getInvalidUpdateKeys<T>({
  update,
  cleaned
}: {
  update: T
  cleaned: T
}): ValidationError[] {
  const updateEntries = flattenEntries(update)
  const cleanedKeys = flattenEntries(cleaned).map(([key]) => key)

  return updateEntries
    .filter(([key]) => !cleanedKeys.includes(key))
    .map(([key, value]) => ({
      message: errorMessages.hiddenField.defaultMessage,
      id: key,
      value
    }))
}
