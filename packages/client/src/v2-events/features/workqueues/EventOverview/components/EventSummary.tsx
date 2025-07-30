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
  getMixedPath
} from '@opencrvs/commons/client'
import { FieldValue } from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
/**
 * Based on packages/client/src/views/RecordAudit/DeclarationInfo.tsx
 */

const messages = {
  assignedTo: {
    label: {
      id: 'v2.event.summary.assignedTo.label',
      defaultMessage: 'Assigned to',
      description: 'Assigned to label'
    },
    value: {
      id: 'v2.event.summary.assignedTo.value',
      defaultMessage: '{event.assignedTo}',
      description: 'Assigned to value'
    },
    emptyValueMessage: {
      id: 'v2.event.summary.assignedTo.empty',
      defaultMessage: 'Not assigned',
      description: 'Not assigned message'
    }
  },
  status: {
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
  event: {
    label: {
      id: 'v2.event.summary.event.label',
      defaultMessage: 'Event',
      description: 'Event label'
    }
  },
  trackingId: {
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
  registrationNumber: {
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
}

export function EventSummary({
  event,
  eventConfiguration,
  hideSecuredFields = false
}: {
  event: Record<string, FieldValue | null>
  eventConfiguration: EventConfig
  hideSecuredFields?: boolean
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const { summary, label: eventLabelMessage } = eventConfiguration
  const declarationFields = getDeclarationFields(eventConfiguration)
  const securedFields = declarationFields
    .filter(({ secured }) => secured)
    .map(({ id }) => id)

  const configuredFields = summary.fields.map((field) => {
    if (field.conditionals && !areConditionsMet(field.conditionals, event)) {
      return null
    }

    if ('fieldId' in field) {
      const config = declarationFields.find((f) => f.id === field.fieldId)
      const value = getMixedPath(event, field.fieldId, '')

      if (!config) {
        return null
      }

      return {
        id: field.fieldId,
        // If a custom label is configured, use it. Otherwise, by default, use the label from the original form field.
        label: field.label ?? config.label,
        emptyValueMessage: field.emptyValueMessage,
        secured: config.secured ?? false,
        value: Output({
          field: config,
          showPreviouslyMissingValuesAsChanged: false,
          value
        })
      }
    }

    const accessedFields = intl.variablesUsed(field.value)

    return {
      id: field.id,
      label: field.label,
      secured: accessedFields.some((fieldId) =>
        securedFields.includes(fieldId)
      ),
      emptyValueMessage: field.emptyValueMessage,
      value: intl.formatMessage(field.value, event)
    }
  })
  const events = useEvents()
  return (
    <>
      <Summary id="summary">
        <button
          onClick={() => {
            events.actions.correction.approve.mutate({
              requestId: '4c7bdfe7-cdf6-4167-8970-d798418f33ce',
              type: 'APPROVE_CORRECTION',
              transactionId: 'sdf0baccd9f-4829-43ef-baab-9348c629dc8d',
              eventId: '0baccd9f-4829-43ef-baab-9348c629dc8d'
            })
          }}
        >
          meo
        </button>
        <Summary.Row
          key="assignedTo"
          data-testid="assignedTo"
          label={intl.formatMessage(messages.assignedTo.label)}
          placeholder={intl.formatMessage(
            messages.assignedTo.emptyValueMessage
          )}
          value={intl.formatMessage(messages.assignedTo.value, event)}
        />
        <Summary.Row
          key="status"
          data-testid="status"
          label={intl.formatMessage(messages.status.label)}
          value={intl.formatMessage(messages.status.value, event)}
        />
        <Summary.Row
          key="event"
          data-testid="event"
          label={intl.formatMessage(messages.event.label)}
          value={intl.formatMessage(eventLabelMessage)}
        />
        <Summary.Row
          key="tracking-id"
          data-testid="tracking-id"
          label={intl.formatMessage(messages.trackingId.label)}
          placeholder={intl.formatMessage(
            messages.trackingId.emptyValueMessage
          )}
          value={intl.formatMessage(messages.trackingId.value, event)}
        />
        <Summary.Row
          key="registrationNumber"
          data-testid="registrationNumber"
          label={intl.formatMessage(messages.registrationNumber.label)}
          placeholder={intl.formatMessage(
            messages.registrationNumber.emptyValueMessage
          )}
          value={intl.formatMessage(messages.registrationNumber.value, event)}
        />
        {configuredFields
          .filter((f): f is NonNullable<typeof f> => f !== null)
          .map((field) => (
            <Summary.Row
              key={field.id}
              data-testid={field.id}
              label={intl.formatMessage(field.label)}
              locked={field.secured && hideSecuredFields}
              placeholder={
                field.emptyValueMessage &&
                intl.formatMessage(field.emptyValueMessage)
              }
              value={field.value}
            />
          ))}
      </Summary>
    </>
  )
}
