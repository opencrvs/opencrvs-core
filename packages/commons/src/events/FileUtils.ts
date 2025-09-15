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

import { FullDocumentPath } from '../documents'
import { FileFieldValue, FileFieldWithOptionValue } from './CompositeFieldValue'
import { EventDocument } from './EventDocument'
import { getAcceptedActions } from './utils'
import { uniq } from 'lodash'

export function getFilepathsFromEvent(
  event: EventDocument
): FullDocumentPath[] {
  const acceptedActions = getAcceptedActions(event)
  const filepaths = acceptedActions.flatMap((action) => {
    const declarationValues = Object.values(action.declaration)
    const annotationValues = Object.values(action.annotation ?? {})

    const actionFilePaths = [...declarationValues, ...annotationValues].flatMap(
      (value) => {
        const fileParsed = FileFieldValue.safeParse(value)
        if (fileParsed.success) {
          return [fileParsed.data.path]
        }

        const fileOptionParsed = FileFieldWithOptionValue.safeParse(value)
        if (fileOptionParsed.success) {
          return fileOptionParsed.data.map((val) => val.path)
        }

        return []
      }
    )

    return actionFilePaths
  })
  return uniq(filepaths)
}
