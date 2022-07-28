/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IDynamicValues } from '@opencrvs/components/lib/interface/GridTable/types'
import { COLUMNS, SORT_ORDER } from '@opencrvs/components/lib/interface'
import { orderBy } from 'lodash'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'

export const getSortedItems = (
  items: IDynamicValues[],
  sortedCol: COLUMNS,
  sortOrder: SORT_ORDER
): IDynamicValues[] => {
  return orderBy(items, [sortedCol], [sortOrder])
}

export const changeSortedColumn = (
  columnName: string,
  presentSortedCol: COLUMNS,
  presentSortOrder: SORT_ORDER
) => {
  let newSortedCol: COLUMNS
  let newSortOrder: SORT_ORDER = SORT_ORDER.ASCENDING

  switch (columnName) {
    case COLUMNS.ICON_WITH_NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.NAME:
      newSortedCol = COLUMNS.NAME
      break
    case COLUMNS.EVENT:
      newSortedCol = COLUMNS.EVENT
      break
    case COLUMNS.DATE_OF_EVENT:
      newSortedCol = COLUMNS.DATE_OF_EVENT
      break
    case COLUMNS.SENT_FOR_REVIEW:
      newSortedCol = COLUMNS.SENT_FOR_REVIEW
      break
    case COLUMNS.SENT_FOR_UPDATES:
      newSortedCol = COLUMNS.SENT_FOR_UPDATES
      break
    case COLUMNS.SENT_FOR_APPROVAL:
      newSortedCol = COLUMNS.SENT_FOR_APPROVAL
      break
    case COLUMNS.REGISTERED:
      newSortedCol = COLUMNS.REGISTERED
      break
    case COLUMNS.SENT_FOR_VALIDATION:
      newSortedCol = COLUMNS.SENT_FOR_VALIDATION
      break
    case COLUMNS.NOTIFICATION_SENT:
      newSortedCol = COLUMNS.NOTIFICATION_SENT
      break
    case COLUMNS.LAST_UPDATED:
      newSortedCol = COLUMNS.LAST_UPDATED
      break
    default:
      newSortedCol = COLUMNS.NAME
  }

  if (newSortedCol === presentSortedCol) {
    if (presentSortOrder === SORT_ORDER.ASCENDING) {
      newSortOrder = SORT_ORDER.DESCENDING
    } else {
      newSortOrder = SORT_ORDER.ASCENDING
    }
  }

  return {
    newSortedCol: newSortedCol,
    newSortOrder: newSortOrder
  }
}

export function getDownloadStatus(
  assignedUserId: string | undefined,
  declaration: IDeclaration | undefined,
  userId: string | undefined
) {
  if (declaration?.registrationStatus === SUBMISSION_STATUS.VALIDATED) {
    return declaration?.downloadStatus
  }

  if (
    [
      DOWNLOAD_STATUS.DOWNLOADING,
      DOWNLOAD_STATUS.FAILED_NETWORK,
      DOWNLOAD_STATUS.FAILED
    ].includes(declaration?.downloadStatus as DOWNLOAD_STATUS)
  ) {
    return declaration?.downloadStatus
  }

  if (assignedUserId === undefined) {
    return undefined
  }

  const downloadStatus =
    assignedUserId === userId ? declaration?.downloadStatus : undefined

  return downloadStatus
}
