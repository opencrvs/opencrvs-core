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
 * Every file an action's values name, whatever field they're in. Reads and
 * writes must agree on this, so a record can't name a file that slips past
 * the check on write but is signed on read.
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

export function getFilePathsFromEvent(event: EventDocument): DocumentPath[] {
  return uniq(
    event.actions.filter(carriesFieldValues).flatMap(getFilePathsFromValues)
  )
}
