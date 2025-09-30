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
import { EventStatus, SelectDateRangeOption } from '@opencrvs/commons/client'

export const statusOptions = [
  {
    value: 'ALL',
    label: {
      defaultMessage: 'Any status',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusAny'
    }
  },
  {
    value: EventStatus.enum.NOTIFIED,
    label: {
      defaultMessage: 'Notified',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusNotified'
    }
  },
  {
    value: EventStatus.enum.DECLARED,
    label: {
      defaultMessage: 'Declared',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusDeclared'
    }
  },
  {
    value: EventStatus.enum.VALIDATED,
    label: {
      defaultMessage: 'Validated',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusValidated'
    }
  },
  {
    value: EventStatus.enum.REGISTERED,
    label: {
      defaultMessage: 'Registered',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusRegistered'
    }
  },
  {
    value: EventStatus.enum.ARCHIVED,
    label: {
      defaultMessage: 'Archived',
      description: 'Option for form field: status of record',
      id: 'advancedSearch.form.recordStatusArchived'
    }
  }
]

export const timePeriodOptions = [
  {
    label: {
      defaultMessage: 'Last 7 days',
      description: 'Label for option of time period select: last 7 days',
      id: 'form.section.label.timePeriodLast7Days'
    },
    value: 'last7Days'
  },
  {
    label: {
      defaultMessage: 'Last 30 days',
      description: 'Label for option of time period select: last 30 days',
      id: 'form.section.label.timePeriodLast30Days'
    },
    value: 'last30Days'
  },
  {
    label: {
      defaultMessage: 'Last 90 days',
      description: 'Label for option of time period select: last 90 days',
      id: 'form.section.label.timePeriodLast90Days'
    },
    value: 'last90Days'
  },
  {
    label: {
      defaultMessage: 'Last year',
      description: 'Label for option of time period select: last year',
      id: 'form.section.label.timePeriodLastYear'
    },
    value: 'last365Days'
  }
] satisfies SelectDateRangeOption[]
