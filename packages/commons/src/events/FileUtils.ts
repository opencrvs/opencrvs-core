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

export function getFilePathsFromEvent(event: EventDocument): DocumentPath[] {
  const filepaths = event.actions
    .filter(carriesFieldValues)
    .flatMap((action) => {
      const declarationValues = Object.values(action.declaration)
      const annotationValues = Object.values(action.annotation ?? {})

      const actionFilePaths = [
        ...declarationValues,
        ...annotationValues
      ].flatMap((value) => {
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

      return actionFilePaths
    })
  return uniq(filepaths)
}
