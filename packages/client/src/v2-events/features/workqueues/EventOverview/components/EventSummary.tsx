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
  getMixedPath,
  Flag,
  ActionFlag,
  InherentFlags,
  TranslationConfig,
  EventDocument
} from '@opencrvs/commons/client'
import { FieldValue } from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
/**
 * Based on packages/client/src/views/RecordAudit/DeclarationInfo.tsx
 */

const messages = {
  assignedTo: {
    label: {
      id: 'event.summary.assignedTo.label',
      defaultMessage: 'Assigned to',
      description: 'Assigned to label'
    },
    value: {
      id: 'event.summary.assignedTo.value',
      defaultMessage: '{event.assignedTo}',
      description: 'Assigned to value'
    },
    emptyValueMessage: {
      id: 'event.summary.assignedTo.empty',
      defaultMessage: 'Not assigned',
      description: 'Not assigned message'
    }
  },
  status: {
    label: {
      id: 'event.summary.status.label',
      defaultMessage: 'Status',
      description: 'Status of the event'
    },
    value: {
      id: 'event.summary.status.value',
      defaultMessage:
        '{event.status, select, CREATED {Draft} NOTIFIED {Notified} VALIDATED {Validated} DRAFT {Draft} DECLARED {Declared} REGISTERED {Registered} CERTIFIED {Certified} REJECTED {Requires update} ARCHIVED {Archived} MARK_AS_DUPLICATE {Marked as a duplicate} other {Unknown}}',
      description: 'Status of the event'
    }
  },
  flags: {
    label: {
      id: 'event.summary.flags.label',
      defaultMessage: 'Flags',
      description: 'Flags of the event'
    },
    placeholder: {
      id: 'event.summary.flags.placeholder',
      defaultMessage: 'No flags',
      description: 'Message when no flags are present'
    }
  },
  event: {
    label: {
      id: 'event.summary.event.label',
      defaultMessage: 'Event',
      description: 'Event label'
    }
  },
  trackingId: {
    label: {
      id: 'event.summary.trackingId.label',
      defaultMessage: 'Tracking ID',
      description: 'Tracking id label'
    },
    emptyValueMessage: {
      id: 'event.summary.trackingId.empty',
      defaultMessage: 'No tracking ID',
      description: 'No tracking ID message'
    },
    value: {
      id: 'event.summary.trackingId.value',
      defaultMessage: '{event.trackingId}',
      description: 'Tracking id value'
    }
  },
  registrationNumber: {
    label: {
      id: 'event.summary.registrationNumber.label',
      defaultMessage: 'Registration Number',
      description: 'Registration Number label'
    },
    emptyValueMessage: {
      id: 'event.summary.registrationNumber.empty',
      defaultMessage: 'No registration number',
      description: 'No registration number message'
    },
    value: {
      id: 'event.summary.registrationNumber.value',
      defaultMessage: '{event.registrationNumber}',
      description: 'Registration number value'
    }
  }
}

export const summaryMessages = messages

const flagMessages = {
  [InherentFlags.CORRECTION_REQUESTED]: {
    id: 'flags.builtin.correction-requested.label',
    defaultMessage: 'Correction requested',
    description: 'Flag label for correction requested'
  },
  [InherentFlags.POTENTIAL_DUPLICATE]: {
    id: 'flags.builtin.potential-duplicate.label',
    defaultMessage: 'Potential duplicate',
    description: 'Flag label for potential duplicate'
  },
  [InherentFlags.REJECTED]: {
    id: 'flags.builtin.rejected.label',
    defaultMessage: 'Rejected',
    description: 'Flag label for rejected'
  },
  [InherentFlags.INCOMPLETE]: {
    id: 'flags.builtin.incomplete.label',
    defaultMessage: 'Incomplete',
    description: 'Flag label for incomplete'
  },
  [InherentFlags.PENDING_CERTIFICATION]: {
    id: 'flags.builtin.pending-certification.label',
    defaultMessage: 'Pending certification',
    description: 'Flag label for pending certification'
  }
} satisfies Record<InherentFlags, TranslationConfig>

export function EventSummary({
  event,
  eventIndex,
  eventConfiguration,
  flags,
  hideSecuredFields = false
}: {
  event?: EventDocument
  eventIndex: Record<string, FieldValue>
  eventConfiguration: EventConfig
  flags: Flag[]
  hideSecuredFields?: boolean
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const validationContext = useValidatorContext(event)
  const { summary, label: eventLabelMessage } = eventConfiguration
  const declarationFields = getDeclarationFields(eventConfiguration)
  const securedFields = declarationFields
    .filter(({ secured }) => secured)
    .map(({ id }) => id)

  const configuredFields = summary.fields.map((field) => {
    if (
      field.conditionals &&
      !areConditionsMet(field.conditionals, eventIndex, validationContext)
    ) {
      return null
    }

    if ('fieldId' in field) {
      const config = declarationFields.find((f) => f.id === field.fieldId)
      const value = getMixedPath(eventIndex, field.fieldId, '')

      if (!config) {
        return null
      }

      return {
        id: field.fieldId,
        // If a custom label is configured, use it. Otherwise, by default, use the label from the original form field.
        label: field.label ?? config.label,
        emptyValueMessage: field.emptyValueMessage,
        secured: config.secured ?? false,
        value: (
          <Output
            eventConfig={eventConfiguration}
            field={config}
            value={value}
          />
        )
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
      value: intl.formatMessage(field.value, eventIndex)
    }
  })

  const flattenedFlags = flags
    .filter((flag) => !ActionFlag.safeParse(flag).success)
    .filter((flag) => flag !== InherentFlags.INCOMPLETE)
    .map((flag) => {
      return intl.formatMessage(flagMessages[flag as InherentFlags])
    })
    .join(', ')

  return (
    <>
      <Summary id="summary">
        <Summary.Row
          key="assignedTo"
          data-testid="assignedTo"
          label={intl.formatMessage(messages.assignedTo.label)}
          placeholder={intl.formatMessage(
            messages.assignedTo.emptyValueMessage
          )}
          value={intl.formatMessage(messages.assignedTo.value, eventIndex)}
        />
        <Summary.Row
          key="status"
          data-testid="status"
          label={intl.formatMessage(messages.status.label)}
          value={intl.formatMessage(messages.status.value, eventIndex)}
        />
        <Summary.Row
          key="flags"
          data-testid="flags"
          label={intl.formatMessage(messages.flags.label)}
          placeholder={intl.formatMessage(messages.flags.placeholder)}
          value={flattenedFlags}
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
          value={intl.formatMessage(messages.trackingId.value, eventIndex)}
        />
        <Summary.Row
          key="registrationNumber"
          data-testid="registrationNumber"
          label={intl.formatMessage(messages.registrationNumber.label)}
          placeholder={intl.formatMessage(
            messages.registrationNumber.emptyValueMessage
          )}
          value={intl.formatMessage(
            messages.registrationNumber.value,
            eventIndex
          )}
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
