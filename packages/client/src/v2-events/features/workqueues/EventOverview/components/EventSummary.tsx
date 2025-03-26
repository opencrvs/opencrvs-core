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

import React from 'react'
import { Summary } from '@opencrvs/components/lib/Summary'
import { SummaryConfig } from '@opencrvs/commons/events'
import { FieldValue, TranslationConfig } from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { RecursiveStringRecord } from '@client/v2-events/hooks/useFormDataStringifier'

/**
 * Based on packages/client/src/views/RecordAudit/DeclarationInfo.tsx
 */

/**
 * @returns default fields for the event summary
 */
function getDefaultFields(
  eventLabel: TranslationConfig
): SummaryConfig['fields'] {
  return [
    {
      id: 'status',
      label: {
        id: 'v2.event.summary.status.label',
        defaultMessage: 'Status',
        description: 'Status of the event'
      },
      value: {
        id: 'v2.event.summary.status.value',
        defaultMessage:
          '{event.status, select, CREATED {Draft} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} other {Unknown}}',
        description: 'Status of the event'
      }
    },
    {
      id: 'event',
      label: {
        id: 'v2.event.summary.event.label',
        defaultMessage: 'Event',
        description: 'Event label'
      },
      value: eventLabel
    },
    {
      id: 'trackind-id',
      label: {
        id: 'v2.event.summary.trackingId.label',
        defaultMessage: 'Tracking ID',
        description: 'Tracking id label'
      },
      emptyValueMessage: {
        id: 'v2.event.summary.trackingId.empty',
        defaultMessage: 'No tracking ID',
        description: 'No tracking ID message'
      },
      value: {
        id: 'v2.event.summary.trackingId.value',
        defaultMessage: '{event.trackingId}',
        description: 'Tracking id value'
      }
    }
  ]
}

export function EventSummary({
  event,
  summary,
  eventLabel
}: {
  event: Record<string, FieldValue | null | RecursiveStringRecord>
  summary: SummaryConfig
  /**
   * Event label to be displayed in the summary page.
   * This label is used for translation purposes and should not be stored in the event data.
   */
  eventLabel: TranslationConfig
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const defaultFields = getDefaultFields(eventLabel)
  const summaryPageFields = [...defaultFields, ...summary.fields]

  return (
    <>
      <Summary id="summary">
        {summaryPageFields.map((field) => {
          return (
            <Summary.Row
              key={field.id}
              data-testid={field.id}
              label={intl.formatMessage(field.label)}
              placeholder={
                field.emptyValueMessage &&
                intl.formatMessage(field.emptyValueMessage)
              }
              value={intl.formatMessage(field.value, event)}
            />
          )
        })}
      </Summary>
    </>
  )
}
