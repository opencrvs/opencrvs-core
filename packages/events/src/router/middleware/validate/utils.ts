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
import {
  ActionUpdate,
  DeclarationFormConfig,
  errorMessages,
  EventState,
  isFieldVisible,
  LocationType,
  ValidatorContext
} from '@opencrvs/commons/events'
import { getOrThrow, flattenEntries } from '@opencrvs/commons'
import { getTokenPayload } from '@opencrvs/commons/authentication'
import { getLeafLocationIds } from '@events/storage/postgres/events/locations'

type ValidationError = {
  message: string
  id: string
  value: unknown
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

/**
 * Compares update vs cleaned payloads and returns an array of offending keys.
 *
 * A key is considered invalid if it appears in the update but not in the cleaned payload —
 * meaning it belongs to a field that should not be present (e.g. a hidden field).
 *
 * Exception: hidden fields with a null value are allowed, since null explicitly signals
 * that the client is clearing the field's value. This is intentional and necessary to
 * remove the field from the current event state.
 */
export function getInvalidUpdateKeys<T>({
  update,
  cleaned,
  formConfig,
  context
}: {
  update: T
  cleaned: T
  formConfig: DeclarationFormConfig
  context: ValidatorContext
}): ValidationError[] {
  const updateEntries = flattenEntries(update)
  const cleanedKeys = flattenEntries(cleaned).map(([key]) => key)

  return updateEntries
    .filter(([key]) => {
      const isInvalidKey = !cleanedKeys.includes(key)

      const field = formConfig.pages
        .flatMap((p) => p.fields)
        .find((f) => f.id === key)

      const isHiddenWithNullValue =
        field &&
        !isFieldVisible(field, update as EventState, context) &&
        update[key as keyof T] === null
      return isInvalidKey && !isHiddenWithNullValue
    })
    .map(([key, value]) => ({
      message: errorMessages.hiddenField.defaultMessage,
      id: key,
      value
    }))
}

export async function getValidatorContext(
  token: string
): Promise<Omit<ValidatorContext, 'event'>> {
  const leafAdminStructureLocationIds = await getLeafLocationIds({
    locationTypes: [LocationType.enum.ADMIN_STRUCTURE]
  })

  const user = getOrThrow(getTokenPayload(token), 'Token is missing.')

  return { leafAdminStructureLocationIds, user }
}
