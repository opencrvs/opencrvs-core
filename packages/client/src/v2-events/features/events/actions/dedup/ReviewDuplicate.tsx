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
  EventIndex,
  getActionReview,
  getCurrentEventState,
  getDeclaration
} from '@opencrvs/commons/client'
import { FormTabs, Frame, Icon, IFormTabs, Spinner } from '@opencrvs/components'
import { Duplicate } from '@opencrvs/components/lib/icons'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { FormHeader } from '@client/v2-events/layouts/form/FormHeader'
import { useContext } from '@client/v2-events/hooks/useContext'
import { findLocalEventDocument } from '../../useEvents/api'
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
  }
}

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

function ReviewDuplicate() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)

  const intl = useIntl()
  const navigate = useNavigate()
  const userContext = useContext()
  const events = useEvents()
  const event = events.getEvent.findFromCache(eventId).data

  useEffect(() => {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn(
        `Event with id ${eventId} not found in cache. Redirecting to overview.`
      )
      return navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
    }
  }, [event, eventId, navigate])

  if (!event) {
    return <div />
  }

  const [selectedTab, selectTab] = useState<string>(event.trackingId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const eventState = getCurrentEventState(event, configuration, userContext)

  const potentialDuplicates = eventState.potentialDuplicates.reduce<
    Record<string, EventIndex>
  >((acc, { id, trackingId }) => {
    const localEvent = findLocalEventDocument(id)
    if (!localEvent) {
      throw new Error(
        `Event with id ${id} and trackingId ${trackingId} not found in cache.`
      )
    }
    acc[trackingId] = getCurrentEventState(
      localEvent,
      configuration,
      userContext
    )
    return acc
  }, {})

  const tabs: IFormTabs[] = [
    {
      id: event.trackingId,
      title: event.trackingId,
      color: 'red',
      icon: <Icon color="red" name="WarningCircle" size="medium" />
    },
    ...eventState.potentialDuplicates.map(({ trackingId }) => ({
      id: trackingId,
      title: trackingId
    }))
  ]

  const { title, fields } = getActionReview(configuration, ActionType.READ)
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const formConfig = getDeclaration(configuration)

  return (
    <Frame
      header={
        <FormHeader
          appbarIcon={<Duplicate />}
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
      {selectedTab === event.trackingId ? (
        <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
          <ReviewComponent.Body
            readonlyMode
            banner={<DuplicateForm eventIndex={eventState} />}
            form={eventState.declaration}
            formConfig={formConfig}
            reviewFields={fields}
            title={formatMessage(title, eventState.declaration)}
            onEdit={noop}
          >
            {null}
          </ReviewComponent.Body>
        </React.Suspense>
      ) : (
        <DuplicateComparison
          originalEvent={eventState}
          potentialDuplicateEvent={potentialDuplicates[selectedTab]}
        />
      )}
    </Frame>
  )
}

export const ReviewDuplicateIndex = withSuspense(ReviewDuplicate)
