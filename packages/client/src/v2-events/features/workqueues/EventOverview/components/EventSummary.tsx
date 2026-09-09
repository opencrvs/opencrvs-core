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
import { List } from '@opencrvs/components/lib/List'
import {
  EventConfig,
  getDeclarationFields,
  areConditionsMet,
  getMixedPath,
  EventIndex,
  EventDocument,
  isFieldSecured,
  FieldValue
} from '@opencrvs/commons/client'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { recordAnchorDate } from '@client/v2-events/utils'
import { convertDateFieldsToUnixTimestamps } from '@client/v2-events/utils'
import { useFlagLabelsString } from '@client/v2-events/messages/flags'
import { InfoBox } from './InfoBox'

const messages = {
  /** Names the bar shown in place of a value the reader may not see. */
  redacted: {
    id: 'event.summary.redacted',
    defaultMessage: 'Hidden',
    description: 'Accessible name for a value the user is not permitted to see'
  },
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

export function EventSummary({
  event,
  eventConfiguration,
  eventIndex,
  hideSecuredFields = false,
  eventDocument
}: {
  event: Record<string, FieldValue>
  eventConfiguration: EventConfig
  eventIndex: EventIndex
  hideSecuredFields?: boolean
  eventDocument?: EventDocument
}) {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const validatorContext = useValidatorContext(eventDocument)
  const flagLabels = useFlagLabelsString(eventConfiguration, eventIndex.flags)
  const { summary, label: eventLabelMessage } = eventConfiguration
  const declarationFields = getDeclarationFields(eventConfiguration)
  const securedFields = declarationFields
    .filter((declarationField) =>
      isFieldSecured(declarationField, eventIndex, validatorContext)
    )
    .map(({ id }) => id)

  const visibleBanners = (summary.banners ?? []).filter(
    (banner) =>
      !banner.conditionals ||
      banner.conditionals.length === 0 ||
      areConditionsMet(banner.conditionals, event, validatorContext, eventIndex)
  )
  const configuredFields = summary.fields.map((field) => {
    if (
      field.conditionals &&
      !areConditionsMet(field.conditionals, event, validatorContext, eventIndex)
    ) {
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
        secured: isFieldSecured(config, eventIndex, validatorContext),
        value: (
          <Output
            anchor={recordAnchorDate(eventIndex)}
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
      value: intl.safeFormatMessage(
        field.value,
        /**
         * Convert any date fields used in the message to unix timestamps, as the message may be expecting timestamps and not date strings.
         *
         * i.e. if the message is something like `{event.updatedAt, date, ::dd MM YYYY}`, then the value of `event.updatedAt`
         * needs to be a unix timestamp for it to be formatted correctly by `intl.formatMessage`.
         */
        convertDateFieldsToUnixTimestamps(event)
      )
    }
  })

  return (
    <>
      {visibleBanners.map((banner, index) => (
        <InfoBox
          key={index}
          background={banner.background}
          data-testid={`summary-info-box-${index}`}
          description={
            banner.description && intl.formatMessage(banner.description)
          }
          heading={intl.formatMessage(banner.heading)}
          icon={banner.icon}
          type={banner.type}
        />
      ))}
      <List id="summary" redactedLabel={intl.formatMessage(messages.redacted)}>
        <List.Item
          key="assignedTo"
          data-testid="assignedTo"
          label={intl.formatMessage(messages.assignedTo.label)}
          placeholder={intl.formatMessage(
            messages.assignedTo.emptyValueMessage
          )}
          value={intl.formatMessage(messages.assignedTo.value, event)}
        />
        <List.Item
          key="status"
          data-testid="status"
          label={intl.formatMessage(messages.status.label)}
          value={intl.formatMessage(messages.status.value, event)}
        />
        <List.Item
          key="flags"
          data-testid="flags"
          label={intl.formatMessage(messages.flags.label)}
          placeholder={intl.formatMessage(messages.flags.placeholder)}
          value={flagLabels}
        />
        <List.Item
          key="event"
          data-testid="event"
          label={intl.formatMessage(messages.event.label)}
          value={intl.formatMessage(eventLabelMessage)}
        />
        <List.Item
          key="tracking-id"
          data-testid="tracking-id"
          label={intl.formatMessage(messages.trackingId.label)}
          placeholder={intl.formatMessage(
            messages.trackingId.emptyValueMessage
          )}
          value={intl.formatMessage(messages.trackingId.value, event)}
        />
        <List.Item
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
            <List.Item
              key={field.id}
              data-testid={field.id}
              label={intl.formatMessage(field.label)}
              placeholder={
                field.emptyValueMessage &&
                intl.formatMessage(field.emptyValueMessage)
              }
              redacted={field.secured && hideSecuredFields}
              value={field.value}
            />
          ))}
      </List>
    </>
  )
}
