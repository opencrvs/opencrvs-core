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

import { IWORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  PERFORMANCE_HOME,
  REGISTRAR_HOME_TAB,
  REGISTRAR_HOME_TAB_PAGE
} from '@client/navigation/routes'
import { EventType } from '@client/utils/gateway'

import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'
import { stringify } from 'qs'

export interface IDynamicValues {
  /*  eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any
}

export function formatUrl(url: string, props: { [key: string]: string }) {
  const formattedUrl = Object.keys(props).reduce(
    (str, key) => str.replace(`:${key}`, props[key]),
    url
  )
  return formattedUrl.endsWith('?') ? formattedUrl.slice(0, -1) : formattedUrl
}

export const generateGoToHomeTabUrl = ({
  tabId,
  selectorId = '',
  pageId = 1
}: {
  tabId: IWORKQUEUE_TABS
  selectorId?: string
  pageId?: number
}) => {
  if (tabId === 'progress') {
    if (selectorId) {
      return formatUrl(REGISTRAR_HOME_TAB_PAGE, {
        tabId,
        selectorId,
        pageId: String(pageId)
      })
    }
    return formatUrl(REGISTRAR_HOME_TAB, { tabId, selectorId })
  }

  return formatUrl(REGISTRAR_HOME_TAB, { tabId, selectorId: String(pageId) })
}

export function generatePerformanceHomeUrl({
  timeStart = new Date(
    startOfMonth(subMonths(new Date(Date.now()), 11)).setHours(0, 0, 0, 0)
  ),
  timeEnd = new Date(new Date(Date.now()).setHours(23, 59, 59, 999)),
  event,
  locationId
}: {
  timeStart?: Date
  timeEnd?: Date
  event?: EventType
  locationId?: string
}) {
  return {
    pathname: PERFORMANCE_HOME,
    search: stringify({
      locationId,
      event,
      timeStart: timeStart.toISOString(),
      timeEnd: timeEnd.toISOString()
    })
  }
}
