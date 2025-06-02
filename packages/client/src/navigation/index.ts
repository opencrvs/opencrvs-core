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
import { CorrectionSection } from '@client/forms'
import {
  CERTIFICATE_COLLECTOR,
  CERTIFICATE_CORRECTION,
  CREATE_USER_SECTION,
  EVENT_COMPLETENESS_RATES,
  ISSUE_CERTIFICATE_PAYMENT,
  ISSUE_COLLECTOR,
  ISSUE_VERIFY_COLLECTOR,
  PERFORMANCE_HOME,
  PERFORMANCE_REGISTRATIONS_LIST,
  PRINT_CERTIFICATE_PAYMENT,
  REGISTRAR_HOME_TAB,
  REGISTRAR_HOME_TAB_PAGE,
  REVIEW_CERTIFICATE,
  REVIEW_USER_FORM,
  VERIFY_COLLECTOR,
  VERIFY_CORRECTOR,
  WORKFLOW_STATUS
} from '@client/navigation/routes'
import { EventType } from '@client/utils/gateway'
import { IStatusMapping } from '@client/views/SysAdmin/Performance/reports/operational/StatusWiseDeclarationCountView'
import { CompletenessRateTime } from '@client/views/SysAdmin/Performance/utils'

import { stringify } from 'query-string'
import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'

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

export const generatePrintCertificateUrl = ({
  registrationId,
  event,
  groupId
}: {
  registrationId: string
  event: string
  groupId?: string
}) =>
  formatUrl(CERTIFICATE_COLLECTOR, {
    registrationId: registrationId.toString(),
    eventType: event.toLowerCase().toString(),
    groupId: groupId || 'certCollector'
  })

export const generateIssueCertificateUrl = ({
  registrationId,
  pageId
}: {
  registrationId: string
  pageId?: string
}) =>
  formatUrl(ISSUE_COLLECTOR, {
    registrationId: registrationId.toString(),
    pageId: pageId ?? 'collector'
  })

export const generateVerifyIssueCollectorUrl = ({
  registrationId,
  event,
  collector
}: {
  registrationId: string
  event: EventType
  collector: string
}) =>
  formatUrl(ISSUE_VERIFY_COLLECTOR, {
    registrationId: registrationId.toString(),
    eventType: event.toLowerCase().toString(),
    collector: collector.toLowerCase().toString()
  })

export const generateCertificateCorrectionUrl = ({
  declarationId,
  pageId
}: {
  declarationId: string
  pageId: CorrectionSection
}) =>
  formatUrl(CERTIFICATE_CORRECTION, {
    declarationId: declarationId.toString(),
    pageId: pageId.toString()
  })

export const generateVerifyCorrectorUrl = ({
  declarationId,
  corrector
}: {
  declarationId: string
  corrector: string
}) =>
  formatUrl(VERIFY_CORRECTOR, {
    declarationId: declarationId.toString(),
    corrector: corrector.toLowerCase().toString()
  })

export const generateReviewCertificateUrl = ({
  registrationId,
  event
}: {
  registrationId: string
  event: EventType
}) =>
  formatUrl(REVIEW_CERTIFICATE, {
    registrationId: registrationId.toString(),
    eventType: event
  })

export const generateVerifyCollectorUrl = ({
  registrationId,
  event,
  collector
}: {
  registrationId: string
  event: string
  collector: string
}) =>
  formatUrl(VERIFY_COLLECTOR, {
    registrationId: registrationId.toString(),
    eventType: event.toLowerCase().toString(),
    collector: collector.toLowerCase().toString()
  })

export const generatePrintCertificatePaymentUrl = ({
  registrationId,
  event
}: {
  registrationId: string
  event: EventType
}) =>
  formatUrl(PRINT_CERTIFICATE_PAYMENT, {
    registrationId: registrationId.toString(),
    eventType: event
  })

export const generateIssueCertificatePaymentUrl = ({
  registrationId,
  event
}: {
  registrationId: string
  event: EventType
}) =>
  formatUrl(ISSUE_CERTIFICATE_PAYMENT, {
    registrationId: registrationId.toString(),
    eventType: event
  })

export const generateCompletenessRatesUrl = ({
  eventType,
  locationId,
  timeStart,
  timeEnd,
  time = CompletenessRateTime.WithinTarget
}: {
  eventType: EventType
  locationId?: string
  timeStart: Date
  timeEnd: Date
  time?: CompletenessRateTime
}) =>
  formatUrl(EVENT_COMPLETENESS_RATES, { eventType }) +
  '?' +
  stringify(
    locationId
      ? {
          locationId,
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString(),
          time
        }
      : {
          timeStart: timeStart.toISOString(),
          timeEnd: timeEnd.toISOString(),
          time
        }
  )

export const generateRegistrationsListUrlConfig = ({
  timeStart,
  timeEnd,
  locationId,
  event,
  filterBy,
  currentPageNumber
}: {
  timeStart: string
  timeEnd: string
  locationId?: string
  event?: string
  filterBy?: string
  currentPageNumber?: number
}) => ({
  pathname: PERFORMANCE_REGISTRATIONS_LIST,
  search: stringify({
    locationId,
    timeStart,
    timeEnd,
    event,
    filterBy,
    currentPageNumber
  })
})

export const generateWorkflowStatusUrl = ({
  locationId,
  timeStart,
  timeEnd,
  status,
  event
}: {
  locationId: string
  timeStart: Date
  timeEnd: Date
  status?: keyof IStatusMapping
  event?: EventType
}) => ({
  pathname: WORKFLOW_STATUS,
  search: stringify({
    locationId,
    status,
    event
  }),
  state: {
    timeStart,
    timeEnd
  }
})

export const generateUserReviewFormUrl = ({
  userId,
  sectionId,
  groupId,
  userFormFieldNameHash
}: {
  userId: string
  sectionId: string
  groupId: string
  userFormFieldNameHash?: string
}) =>
  formatUrl(REVIEW_USER_FORM, {
    userId,
    sectionId,
    groupId
  }) + (userFormFieldNameHash ? `#${userFormFieldNameHash}` : '')

export const generateCreateUserSectionUrl = ({
  sectionId,
  groupId,
  userFormFieldNameHash
}: {
  sectionId: string
  groupId: string
  userFormFieldNameHash?: string
}) =>
  formatUrl(CREATE_USER_SECTION, {
    sectionId,
    groupId
  }) + (userFormFieldNameHash ? `#${userFormFieldNameHash}` : '')

export const generateGoToPageGroupUrl = ({
  pageRoute,
  declarationId,
  pageId,
  groupId,
  event,
  fieldNameHash,
  historyState
}: {
  pageRoute: string
  declarationId: string
  pageId: string
  groupId: string
  event: string
  fieldNameHash?: string
  historyState?: IDynamicValues
}) =>
  formatUrl(pageRoute, {
    declarationId: declarationId.toString(),
    pageId,
    groupId,
    event
  }) + (fieldNameHash ? `#${fieldNameHash}` : '')

export const generateGoToPageUrl = ({
  pageRoute,
  declarationId,
  pageId,
  event
}: {
  pageRoute: string
  declarationId: string
  pageId: string
  event: string
}) =>
  formatUrl(pageRoute, {
    declarationId: declarationId.toString(),
    pageId,
    event
  })
