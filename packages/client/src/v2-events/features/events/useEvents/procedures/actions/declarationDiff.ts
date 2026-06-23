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

import { isEmpty } from 'lodash'
import {
  ActionUpdate,
  deepMerge,
  EventConfig,
  EventState,
  omitHiddenPaginatedFields,
  ValidatorContext
} from '@opencrvs/commons/client'

/**
 * Structurally empty: `undefined`/`null`/`''`, or an array/object whose every
 * leaf is empty. Complex fields (NAME, ADDRESS) clear to nested objects of empty
 * strings (e.g. `{ firstname: '', surname: '' }`), which a shallow truthiness
 * check would wrongly treat as filled. `0` and `false` are real values and are
 * not considered empty.
 */
export function isDeeplyEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.every(isDeeplyEmpty)
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isDeeplyEmpty)
  }
  return false
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** True when a subfield is absent from the diff or present but empty. */
function wasSubfieldClearedInDiff(
  submitted: Record<string, unknown>,
  key: string
): boolean {
  return !(key in submitted) || isDeeplyEmpty(submitted[key])
}

/**
 * Composite fields (ADDRESS, NAME) strip empty subfields from correction payloads.
 * When merging a partial diff, `deepMerge` only overwrites keys that are present —
 * cleared nested subfields must be sent as explicit `null` values instead.
 *
 * Walks `original` (the registered value) against `submitted` (the correction
 * diff) and returns a copy of `submitted` where every cleared subfield is `null`.
 */
export function nullifyClearedNestedFields(
  original: unknown,
  submitted: unknown
): unknown {
  if (isDeeplyEmpty(submitted)) {
    return isDeeplyEmpty(original) ? submitted : null
  }

  if (!isPlainObject(original) || !isPlainObject(submitted)) {
    return submitted
  }

  const result: Record<string, unknown> = { ...submitted }

  for (const [key, originalValue] of Object.entries(original)) {
    if (isDeeplyEmpty(originalValue)) {
      continue
    }

    const submittedValue = submitted[key]

    if (wasSubfieldClearedInDiff(submitted, key)) {
      result[key] = isPlainObject(originalValue)
        ? nullifyClearedNestedFields(
            originalValue,
            key in submitted ? submittedValue : {}
          )
        : null
      continue
    }

    if (isPlainObject(originalValue) && isPlainObject(submittedValue)) {
      result[key] = nullifyClearedNestedFields(originalValue, submittedValue)
    }
  }

  return result
}

// Merge actionUpdate with the existing declaration to avoid losing dependent fields.
// For example: if the correction payload contains only `informant.name`, but not `informant.relation`,
// running omitHiddenPaginatedFields on the payload alone would remove `informant.name` (since its parent `informant.relation` is missing).
// By merging first, we preserve such dependencies, and then run a diff to keep only the valid correction fields.
export function getCleanedDeclarationDiff({
  eventConfiguration,
  originalDeclaration,
  declarationDiff,
  validatorContext,
  treatMissingAsCleared = false
}: {
  eventConfiguration: EventConfig
  originalDeclaration?: EventState
  declarationDiff?: EventState
  validatorContext: ValidatorContext
  /**
   * When true (full-form actions such as edits), a field that was non-empty in
   * the original declaration but is missing from the submitted form was cleared
   * by the user and is emitted as `null`. Must stay false for partial payloads
   * (e.g. corrections) where a missing field simply isn't part of the payload.
   * Fields explicitly present in the diff as empty are always emitted as `null`
   * when the original held a value, regardless of this flag.
   */
  treatMissingAsCleared?: boolean
}): ActionUpdate | undefined {
  if (isEmpty(declarationDiff)) {
    return declarationDiff
  }

  // If there's no original declaration, just clean the update and return it
  if (isEmpty(originalDeclaration)) {
    return omitHiddenPaginatedFields(
      eventConfiguration.declaration,
      declarationDiff,
      validatorContext,
      true
    )
  }

  // Merge original + updates so we get the final event state
  // (Needed because omitHiddenPaginatedFields func requires a full snapshot, not partial)
  const merged = deepMerge(originalDeclaration, declarationDiff)

  // Remove any hidden/paginated fields from the merged declaration
  // But retain hidden fields with empty values indicating they should be removed.
  // Because hidden fields with values in current event state causes confusion and bug in search endpoint
  // (Ensures we only consider fields relevant to the event configuration)
  const cleanedDeclarationWithHiddenFieldsWithNullValues =
    omitHiddenPaginatedFields(
      eventConfiguration.declaration,
      merged,
      validatorContext,
      true
    )

  // From the update, keep only fields that are valid in the cleaned declaration
  // (Prevents applying updates to hidden/invalid fields)
  const cleanedDiff: ActionUpdate = Object.fromEntries(
    Object.entries(declarationDiff).filter(
      ([key]) => key in cleanedDeclarationWithHiddenFieldsWithNullValues
    )
  )

  // A field explicitly present in the diff but now empty was cleared by the
  // user. Emit `null` even when omitHiddenPaginatedFields dropped the field
  // from the merged snapshot (e.g. optional NUMBER fields cleared to empty).
  // For composite fields, also null cleared nested leaves omitted from the payload.
  for (const [key, submittedValue] of Object.entries(declarationDiff)) {
    if (!(key in originalDeclaration)) {
      continue
    }
    const originalValue = originalDeclaration[key]
    if (isDeeplyEmpty(originalValue)) {
      continue
    }

    const valueWithClearedNests = nullifyClearedNestedFields(
      originalValue,
      submittedValue
    )
    const isValidInCleanedDeclaration =
      key in cleanedDeclarationWithHiddenFieldsWithNullValues

    if (
      valueWithClearedNests === null ||
      isDeeplyEmpty(valueWithClearedNests)
    ) {
      // Emit null for explicit clears even when omitHiddenPaginatedFields
      // dropped the field (e.g. optional NUMBER fields).
      if (isValidInCleanedDeclaration || isDeeplyEmpty(submittedValue)) {
        cleanedDiff[key] = null
      }
    } else if (isValidInCleanedDeclaration) {
      cleanedDiff[key] = valueWithClearedNests as ActionUpdate[string]
    }
  }

  // For full-form actions, a field missing from the diff was also cleared.
  if (treatMissingAsCleared && originalDeclaration) {
    for (const key of Object.keys(originalDeclaration)) {
      if (key in declarationDiff) {
        continue
      }
      if (!(key in cleanedDeclarationWithHiddenFieldsWithNullValues)) {
        continue
      }
      if (isDeeplyEmpty(originalDeclaration[key])) {
        continue
      }
      cleanedDiff[key] = null
    }
  }

  return cleanedDiff
}
