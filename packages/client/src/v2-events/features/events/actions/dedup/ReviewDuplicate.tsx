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

import React, { useEffect, useState } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import {
  ActionType,
  EventConfig,
  EventDocument,
  EventIndex,
  getCurrentEventState,
  getDeclaration,
  eventAttachmentPath
} from '@opencrvs/commons/client'
import { FormTabs, Frame, Icon, IFormTabs, Text } from '@opencrvs/components'
import {
  useEventConfigurationForRecord,
  useEventConfigurationResolver
} from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { SuspenseLoadingFallback } from '@client/v2-events/components/SuspenseLoadingFallback'
import { FormHeader } from '@client/v2-events/layouts/form/FormHeader'
import { recordAnchorDate } from '@client/v2-events/utils'
import { findLocalEventDocument } from '../../useEvents/api'
import { useValidatorContext } from '../../../../hooks/useValidatorContext'
import { DuplicateForm } from './DuplicateForm'
import { DuplicateComparison } from './DuplicateComparison'

export const duplicateMessages = {
  duplicateDeclarationDetails: {
    id: 'duplicates.content.header',
    defaultMessage: 'Declaration details',
    description: 'Declaration details header of two duplicate ones'
  },
  duplicateReviewHeader: {
    id: 'duplicates.review.header',
    defaultMessage: 'Potential {event} duplicate review',
    description: 'Review page header for duplicates declarations'
  },
  duplicateContentTitle: {
    id: 'duplicates.content.title',
    defaultMessage: 'Is {name} ({trackingId}) a duplicate?',
    description: 'Duplicates content title message'
  },
  duplicateContentSubtitle: {
    id: 'duplicates.content.subtitle',
    defaultMessage:
      'This record was flagged as a potential duplicate of: {trackingIds}. Please review these by clicking on each tracking ID in the tab section to view a side-by-side comparison below, and confirm if this record is a duplicate.',
    description: 'Duplicates content subtitle message'
  },
  notDuplicateButton: {
    id: 'duplicates.button.notDuplicate',
    defaultMessage: 'Not a duplicate',
    description: 'Not a duplicate button text'
  },
  markAsDuplicateButton: {
    id: 'duplicates.button.markAsDuplicate',
    defaultMessage: 'Mark as duplicate',
    description: 'Mark as duplicate button text'
  },
  markAsDuplicateConfirmationTitle: {
    id: 'duplicates.content.markAsDuplicate',
    defaultMessage: 'Mark {trackingId} as duplicate?',
    description: 'Mark as duplicate content confirmation title message'
  },
  duplicateDropdownMessage: {
    id: 'duplicates.content.duplicateDropdownMessage',
    defaultMessage: 'Duplicate of',
    description: 'Selecting from the duplicate trackingIds'
  },
  markAsDuplicateReason: {
    id: 'duplicates.content.markAsDuplicateReason',
    defaultMessage: 'Please describe your reason',
    description: 'Review page header for duplicates declarations'
  },
  notDuplicateContentConfirmationTitle: {
    id: 'duplicates.content.notDuplicateConfirmationTitle',
    defaultMessage: 'Are you sure {name} ({trackingId}) is not duplicate?',
    description: 'Not a duplicate content confirmation title message'
  },
  duplicateComparePageTitle: {
    id: 'duplicates.compare.title',
    defaultMessage: 'Review {actualTrackingId} against {duplicateTrackingId}',
    description: 'Duplicate compare page title message'
  },
  duplicateComparePageSupportingDocuments: {
    id: 'duplicates.compare.supportingDocuments',
    defaultMessage: 'Supporting documents',
    description: 'Supporting documents header for duplicates comparison'
  },
  registeredAt: {
    id: 'duplicates.content.registeredAt',
    defaultMessage: 'Registered at',
    description: 'Registered at label for duplicates comparison'
  },
  registeredBy: {
    id: 'duplicates.content.registeredBy',
    defaultMessage: 'Registered by',
    description: 'Registered by label for duplicates comparison'
  },
  unknownConfigVersion: {
    id: 'duplicates.content.unknownConfigVersion',
    defaultMessage:
      '{trackingId} cannot be compared: its configuration version "{version}" is not available.',
    description:
      'Shown under the tabs of the duplicate review when a potential duplicate was created under a configuration version that is not available'
  },
  notDuplicateContentConfirmationDescription: {
    id: 'duplicates.content.notDuplicateContentConfirmationDescription',
    defaultMessage:
      'By clicking "Confirm", the event will be marked as not a duplicate.',
    description: 'Not a duplicate content confirmation description message'
  }
}

const UnknownVersionNotice = styled.div`
  padding: 8px ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  top: 0;
  width: 100%;
  position: sticky;
  z-index: 1;
`

function ReviewDuplicateBody({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const validatorContext = useValidatorContext(event)
  const [selectedTab, selectTab] = useState<string>(event.trackingId)

  const { eventConfiguration: configuration } =
    useEventConfigurationForRecord(event)
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const resolveEventConfiguration = useEventConfigurationResolver()

  const eventState = getCurrentEventState(event, configuration)

  // Each potential duplicate is read with the version it was created under.
  // A potential duplicate whose version is not available cannot be compared.
  const unknownVersionDuplicates: EventDocument[] = []
  const potentialDuplicates = eventState.potentialDuplicates.reduce<
    Record<
      string,
      {
        event: EventDocument
        eventConfiguration: EventConfig
        eventState: EventIndex
      }
    >
  >((acc, { id, trackingId }) => {
    const localEvent = findLocalEventDocument(id)
    if (!localEvent) {
      throw new Error(
        `Event with id ${id} and trackingId ${trackingId} not found in cache.`
      )
    }
    const duplicateConfiguration = resolveEventConfiguration(localEvent)
    if (!duplicateConfiguration) {
      unknownVersionDuplicates.push(localEvent)
      return acc
    }
    acc[trackingId] = {
      event: localEvent,
      eventConfiguration: duplicateConfiguration,
      eventState: getCurrentEventState(localEvent, duplicateConfiguration)
    }
    return acc
  }, {})

  const tabs: IFormTabs[] = [
    {
      id: event.trackingId,
      title: event.trackingId,
      color: 'red',
      icon: <Icon color="red" name="WarningCircle" size="medium" />
    },
    // A potential duplicate of an unknown version gets a grey, disabled tab.
    // The line under the tabs says why. Only the record under review has the
    // warning icon.
    ...eventState.potentialDuplicates.map(({ trackingId }) =>
      trackingId in potentialDuplicates
        ? { id: trackingId, title: trackingId }
        : {
            id: trackingId,
            title: trackingId,
            disabled: true,
            color: 'grey400' as const
          }
    )
  ]

  const actionConfiguration = configuration.actions.find(
    (a) => a.type === ActionType.READ
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const { title, fields } = actionConfiguration.review

  const formConfig = getDeclaration(configuration)

  return (
    <Frame
      header={
        <FormHeader
          label={intl.formatMessage(duplicateMessages.duplicateReviewHeader, {
            event: intl.formatMessage(configuration.label)
          })}
          route={ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE}
        />
      }
      skipToContentText="Skip to form"
    >
      <TopBar>
        <FormTabs
          activeTabId={selectedTab}
          sections={tabs}
          onTabClick={(id: string) => selectTab(id)}
        />
      </TopBar>
      {unknownVersionDuplicates.map((duplicate) => (
        <UnknownVersionNotice
          key={duplicate.id}
          data-testid={`unknown-config-version-${duplicate.id}`}
        >
          <Text color="negative" element="p" variant="reg14">
            {intl.formatMessage(duplicateMessages.unknownConfigVersion, {
              trackingId: duplicate.trackingId,
              version: duplicate.configVersionId
            })}
          </Text>
        </UnknownVersionNotice>
      ))}
      {selectedTab === event.trackingId ? (
        <React.Suspense
          fallback={<SuspenseLoadingFallback id="event-form-spinner" />}
        >
          <ReviewComponent.Body
            readonlyMode
            anchor={recordAnchorDate(eventState)}
            attachmentPath={eventAttachmentPath(eventState.id)}
            banner={<DuplicateForm eventIndex={eventState} />}
            form={eventState.declaration}
            formConfig={formConfig}
            reviewFields={fields}
            title={formatMessage(title, eventState.declaration)}
            validatorContext={validatorContext}
            onEdit={noop}
          >
            {null}
          </ReviewComponent.Body>
        </React.Suspense>
      ) : (
        <DuplicateComparison
          originalEvent={event}
          originalEventConfiguration={configuration}
          originalEventState={eventState}
          potentialDuplicateEvent={potentialDuplicates[selectedTab].event}
          potentialDuplicateEventConfiguration={
            potentialDuplicates[selectedTab].eventConfiguration
          }
          potentialDuplicateEventState={
            potentialDuplicates[selectedTab].eventState
          }
        />
      )}
    </Frame>
  )
}

function ReviewDuplicate() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)

  const navigate = useNavigate()
  const events = useEvents()
  const event = events.getEvent.useFindEventFromCache(eventId).data

  useEffect(() => {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn(
        `Event with id ${eventId} not found in cache. Redirecting to overview.`
      )
      return navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }))
    }
  }, [event, eventId, navigate])

  if (!event) {
    return <div />
  }

  return <ReviewDuplicateBody event={event} />
}

export const ReviewDuplicateIndex = withSuspense(ReviewDuplicate)
