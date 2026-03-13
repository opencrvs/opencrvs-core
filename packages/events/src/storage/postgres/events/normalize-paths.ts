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

import {
  ensureDocumentPath,
  EventDocument,
  Draft,
  FileFieldValue,
  FileFieldWithOptionValue
} from '@opencrvs/commons'

function normalizeFieldPaths(
  fields: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    const fileParsed = FileFieldValue.safeParse(value)
    if (fileParsed.success) {
      normalized[key] = {
        ...fileParsed.data,
        path: ensureDocumentPath(fileParsed.data.path)
      }
      continue
    }

    const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
    if (fileOptionParsed.success) {
      normalized[key] = fileOptionParsed.data.map((v) => ({
        ...v,
        path: ensureDocumentPath(v.path)
      }))
      continue
    }

    normalized[key] = value
  }
  return normalized
}

function normalizeActionPaths<T extends Record<string, unknown>>(action: T): T {
  const result: Record<string, unknown> = { ...action }

  if (
    'createdBySignature' in result &&
    typeof result.createdBySignature === 'string'
  ) {
    result.createdBySignature = ensureDocumentPath(
      result.createdBySignature as string
    )
  }

  if (
    'declaration' in result &&
    result.declaration &&
    typeof result.declaration === 'object'
  ) {
    result.declaration = normalizeFieldPaths(
      result.declaration as Record<string, unknown>
    )
  }

  if (
    'annotation' in result &&
    result.annotation &&
    typeof result.annotation === 'object'
  ) {
    result.annotation = normalizeFieldPaths(
      result.annotation as Record<string, unknown>
    )
  }

  return result as T
}

/**
 * Normalizes all file paths in an EventDocument to use DocumentPath format
 * (without bucket prefix). This handles old data stored with FullDocumentPath.
 */
export function normalizeEventDocumentPaths(
  event: EventDocument
): EventDocument {
  return {
    ...event,
    actions: event.actions.map(normalizeActionPaths)
  }
}

/**
 * Normalizes all file paths in a Draft to use DocumentPath format.
 */
export function normalizeDraftPaths(draft: Draft): Draft {
  return {
    ...draft,
    action: normalizeActionPaths(draft.action)
  }
}
