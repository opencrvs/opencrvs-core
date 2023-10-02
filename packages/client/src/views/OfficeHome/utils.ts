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
import { COLUMNS, SORT_ORDER } from '@opencrvs/components/lib/Workqueue'
import { orderBy } from 'lodash'
import { ITaskHistory } from '@client/declarations'

export const getSortedItems = <T = any>(
  items: T[],
  sortedCol: COLUMNS,
  sortOrder: SORT_ORDER
) => {
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
    case COLUMNS.TRACKING_ID:
      newSortedCol = COLUMNS.TRACKING_ID
      break
    case COLUMNS.REGISTRATION_NO:
      newSortedCol = COLUMNS.REGISTRATION_NO
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

export const getStatusWiseWQTab = (status: string) => {
  switch (status) {
    case 'REGISTERED':
      return 'printTab'
    case 'VALIDATED':
      return 'approvalTab'
    case 'ISSUED':
      return 'issueTab'
    default:
      return 'reviewTab'
  }
}

export const getPreviousOperationDateByOperationType = (
  operationHistories: ITaskHistory[],
  operationType: string
): Date | null => {
  const prevOperationHistoriesByType =
    operationHistories &&
    operationHistories
      .filter((e) => e.operationType === operationType)
      .sort((a, b) => {
        if (!a.operatedOn || !b.operatedOn) {
          return -1
        }
        if (a.operatedOn > b.operatedOn) {
          return -1
        }
        if (a.operatedOn < b.operatedOn) {
          return 1
        }
        return 0
      })

  const prevOperationHistory =
    prevOperationHistoriesByType &&
    prevOperationHistoriesByType.length > 0 &&
    prevOperationHistoriesByType[0]

  if (!prevOperationHistory || !prevOperationHistory.operatedOn) {
    return null
  }

  return new Date(prevOperationHistory.operatedOn)
}
