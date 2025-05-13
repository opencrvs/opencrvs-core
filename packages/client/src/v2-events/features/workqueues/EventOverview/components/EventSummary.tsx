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
import {
  EventConfig,
  getDeclarationFields,
  areConditionsMet,
  SummaryConfig,
  EventIndex
} from '@opencrvs/commons/client'
import { FieldValue, TranslationConfig } from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { Output } from '@client/v2-events/features/events/components/Output'
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
          '{event.status, select, CREATED {Draft} NOTIFIED {Incomplete} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARKED_AS_DUPLICATE {Marked as a duplicate} other {Unknown}}',
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
      id: 'tracking-id',
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
    },
    {
      id: 'registrationNumber',
      label: {
        id: 'v2.event.summary.registrationNumber.label',
        defaultMessage: 'Registration Number',
        description: 'Registration Number label'
      },
      emptyValueMessage: {
        id: 'v2.event.summary.registrationNumber.empty',
        defaultMessage: 'No registration number',
        description: 'No registration number message'
      },
      value: {
        id: 'v2.event.summary.registrationNumber.value',
        defaultMessage: '{event.registrationNumber}',
        description: 'Registration number value'
      }
    }
  ]
}

export function EventSummary({
  event,
  eventConfiguration
}: {
  event: Record<string, FieldValue | null>
  eventConfiguration: EventConfig
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const { summary, label } = eventConfiguration
  const defaultFields = getDefaultFields(label)
  const summaryPageFields = [...defaultFields, ...summary.fields]
  const declarationFields = getDeclarationFields(eventConfiguration)

  const fields = summaryPageFields.map((field) => {
    if (field.conditionals && !areConditionsMet(field.conditionals, event)) {
      return null
    }

    if ('fieldId' in field) {
      const config = declarationFields.find((f) => f.id === field.fieldId)
      const value = event[field.fieldId] ?? undefined

      if (!config) {
        return null
      }

      return {
        id: field.fieldId,
        label: config.label,
        emptyValueMessage: field.emptyValueMessage,
        value: Output({
          field: config,
          showPreviouslyMissingValuesAsChanged: false,
          value: value
        })
      }
    }

    return {
      id: field.id,
      label: field.label,
      emptyValueMessage: field.emptyValueMessage,
      value: intl.formatMessage(field.value, event)
    }
  })

  return (
    <>
      <Summary id="summary">
        {fields
          .filter((f): f is NonNullable<typeof f> => f !== null)
          .map((field) => {
            return (
              <Summary.Row
                key={field.id}
                data-testid={field.id}
                label={intl.formatMessage(field.label)}
                placeholder={
                  field.emptyValueMessage &&
                  intl.formatMessage(field.emptyValueMessage)
                }
                value={field.value}
              />
            )
          })}
      </Summary>
    </>
  )
}
