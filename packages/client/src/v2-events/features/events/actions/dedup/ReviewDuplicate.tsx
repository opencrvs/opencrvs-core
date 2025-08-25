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

import React, { useMemo } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import { useIntl } from 'react-intl'
import {
  ActionType,
  getActionReview,
  getCurrentEventState,
  applyDraftToEventIndex,
  getDeclaration
} from '@opencrvs/commons/client'
import { Frame, Spinner } from '@opencrvs/components'
import { Duplicate } from '@opencrvs/components/lib/icons'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { FormHeader } from '@client/v2-events/layouts/form/FormHeader'

const DuplicateMessages = {
  duplicateDeclarationDetails: {
    id: 'v2.duplicates.content.header',
    defaultMessage: 'Declaration Details',
    description: 'Declaration details header of two duplicate ones'
  },
  duplicateReviewHeader: {
    id: 'v2.duplicates.review.header',
    defaultMessage: 'Potential {event} duplicate review',
    description: 'Review page header for duplicates declarations'
  },
  duplicateContentTitle: {
    id: 'v2.duplicates.content.title',
    defaultMessage: 'Is {name} ({trackingId}) a duplicate?',
    description: 'Duplicates content title message'
  },
  duplicateContentSubtitle: {
    id: 'v2.duplicates.content.subtitle',
    defaultMessage:
      'This record was flagged as a potential duplicate of: {trackingIds}. Please review these by clicking on each tracking ID in the tab section to view a side-by-side comparison below, and confirm if this record is a duplicate.',
    description: 'Duplicates content subtitle message'
  },
  notDuplicateButton: {
    id: 'v2.duplicates.button.notDuplicate',
    defaultMessage: 'Not a duplicate',
    description: 'Not a duplicate button text'
  },
  markAsDuplicateButton: {
    id: 'v2.duplicates.button.markAsDuplicate',
    defaultMessage: 'Mark as duplicate',
    description: 'Mark as duplicate button text'
  },
  markAsDuplicateConfirmationTitle: {
    id: 'v2.duplicates.content.markAsDuplicate',
    defaultMessage: 'Mark {trackingId} as duplicate?',
    description: 'Mark as duplicate content confirmation title message'
  },
  duplicateDropdownMessage: {
    id: 'v2.duplicates.content.duplicateDropdownMessage',
    defaultMessage: 'Duplicate of',
    description: 'Selecting from the duplicate trackingIds'
  },
  markAsDuplicateReason: {
    id: 'v2.duplicates.content.markAsDuplicateReason',
    defaultMessage: 'Please describe your reason',
    description: 'Review page header for duplicates declarations'
  },
  notDuplicateContentConfirmationTitle: {
    id: 'v2.duplicates.content.notDuplicateConfirmationTitle',
    defaultMessage: 'Are you sure {name} ({trackingId}) is not duplicate?',
    description: 'Not a duplicate content confirmation title message'
  },
  duplicateComparePageTitle: {
    id: 'v2.duplicates.compare.title',
    defaultMessage: 'Review {actualTrackingId} against {duplicateTrackingId}',
    description: 'Duplicate compare page title message'
  },
  duplicateComparePageSupportingDocuments: {
    id: 'v2.duplicates.compare.supportingDocuments',
    defaultMessage: 'Supporting documents',
    description: 'Supporting documents header for duplicates comparison'
  }
}

function ReviewDuplicate() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)

  const intl = useIntl()

  const events = useEvents()
  const event = events.getEvent.viewEvent(eventId)

  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(event.id)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const eventStateWithDraft = useMemo(() => {
    const eventState = getCurrentEventState(event, configuration)

    return draft
      ? applyDraftToEventIndex(eventState, draft, configuration)
      : eventState
  }, [draft, event, configuration])

  const { title, fields } = getActionReview(configuration, ActionType.READ)
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const formConfig = getDeclaration(configuration)

  return (
    <Frame
      header={
        <FormHeader
          appbarIcon={<Duplicate />}
          label={intl.formatMessage(DuplicateMessages.duplicateReviewHeader, {
            event: intl.formatMessage(configuration.label)
          })}
          route={ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE}
        />
      }
      skipToContentText="Skip to form"
    >
      <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
        <ReviewComponent.Body
          readonlyMode
          form={eventStateWithDraft.declaration}
          formConfig={formConfig}
          reviewFields={fields}
          title={formatMessage(title, eventStateWithDraft.declaration)}
          onEdit={noop}
        >
          <></>
        </ReviewComponent.Body>
      </React.Suspense>
    </Frame>
  )
}

export const ReviewDuplicateIndex = withSuspense(ReviewDuplicate)
