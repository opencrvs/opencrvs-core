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

import { DocumentPath } from '../documents'
import { Action, ActionDocument } from './ActionDocument'
import { FileFieldValue, FileFieldWithOptionValue } from './CompositeFieldValue'
import { EventDocument } from './EventDocument'
import { uniq } from 'lodash'

function carriesFieldValues(action: Action): action is ActionDocument {
  return 'declaration' in action
}

/**
 * Paths of every file in an action's declaration and annotation, from single-
 * and multi-file values, whatever the field type. File checks on write and
 * presigning on read both use this, so they always cover the same files.
 */
export function getFilePathsFromValues({
  declaration,
  annotation
}: {
  declaration: Record<string, unknown>
  annotation?: Record<string, unknown> | null
}): DocumentPath[] {
  const values = [
    ...Object.values(declaration),
    ...Object.values(annotation ?? {})
  ]

  return uniq(
    values.flatMap((value) => {
      const fileParsed = FileFieldValue.safeParse(value)
      if (fileParsed.success) {
        return [fileParsed.data.path]
      }

      const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
      if (fileOptionParsed.success) {
        return fileOptionParsed.data.map((val) => val.path)
      }

      return []
    })
  )
}

/**
 * Every file the record names: its actions' field values and the signatures
 * of the users who performed them.
 */
export function getFilePathsFromEvent(event: EventDocument): DocumentPath[] {
  return uniq(
    event.actions.flatMap((action) => [
      ...(carriesFieldValues(action) ? getFilePathsFromValues(action) : []),
      ...('createdBySignature' in action && action.createdBySignature
        ? [action.createdBySignature]
        : [])
    ])
  )
}
