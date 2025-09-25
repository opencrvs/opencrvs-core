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

import * as React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { Content } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/src/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { EventIndex, EventStatus, getUUID } from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes/routes'
import { useContext } from '@client/v2-events/hooks/useContext'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useEventTitle } from '../../useEvents/useEventTitle'
import { useEvents } from '../../useEvents/useEvents'
import { duplicateMessages } from './ReviewDuplicate'
import { MarkAsNotDuplicateModal } from './MarkAsNotDuplicateModal'
import {
  MarkAsDuplicateContent,
  MarkAsDuplicateModal
} from './MarkAsDuplicateModal'

const SubPageContent = styled(Content)`
  margin: auto 0 20px;
  max-width: 100%;
`

export const DuplicateForm = ({ eventIndex }: { eventIndex: EventIndex }) => {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const userContext = useContext()
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE
  )

  const intl = useIntl()

  const { actions, customActions } = useEvents()

  const navigate = useNavigate()
  const { getEventTitle } = useEventTitle()

  const { eventConfiguration: configuration } = useEventConfiguration(
    eventIndex.type
  )

  const [modal, openModal] = useModal()

  const { title: name } = getEventTitle(configuration, eventIndex)

  const trackingIds = eventIndex.potentialDuplicates
    .map((duplicate) => duplicate.trackingId)
    .join(', ')

  const notADuplicateButton = (
    <Button
      key="btn-not-a-duplicate"
      fullWidth
      id="not-a-duplicate"
      type="positive"
      onClick={async () => {
        const marAsNotDuplicate = await openModal<boolean>((close) => (
          <MarkAsNotDuplicateModal
            close={close}
            name={name || ''}
            trackingId={eventIndex.trackingId}
          />
        ))
        if (marAsNotDuplicate) {
          actions.duplicate.markNotDuplicate.mutate({
            transactionId: getUUID(),
            eventId: eventIndex.id,
            keepAssignment: true
          })

          if (eventIndex.status === EventStatus.Values.DECLARED) {
            navigate(ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({ eventId }))
          } else {
            navigate(ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({ eventId }))
          }
        }
      }}
    >
      <Icon name="NotePencil" />
      {intl.formatMessage(duplicateMessages.notDuplicateButton)}
    </Button>
  )

  const markAsDuplicateButton = (
    <Button
      key="btn-mark-as-duplicate"
      fullWidth
      id="mark-as-duplicate"
      type="negative"
      onClick={async () => {
        const markAsDuplicateContent = await openModal<
          MarkAsDuplicateContent | undefined
        >((close) => (
          <MarkAsDuplicateModal
            close={close}
            duplicates={eventIndex.potentialDuplicates}
            originalTrackingId={eventIndex.trackingId}
          />
        ))
        if (markAsDuplicateContent) {
          customActions.archiveOnDuplicate.mutate({
            content: markAsDuplicateContent,
            transactionId: getUUID(),
            eventId: eventIndex.id,
            declaration: {}
          })

          if (slug) {
            navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug }))
          } else {
            navigate(ROUTES.V2.EVENTS.OVERVIEW.buildPath({ eventId }))
          }
        }
      }}
    >
      <Icon name="Archive" />
      {intl.formatMessage(duplicateMessages.markAsDuplicateButton)}
    </Button>
  )
  return (
    <>
      <div>
        <SubPageContent
          bottomActionButtons={[notADuplicateButton, markAsDuplicateButton]}
          bottomActionDirection="row"
          showTitleOnMobile={true}
          subtitle={intl.formatMessage(
            duplicateMessages.duplicateContentSubtitle,
            {
              trackingIds
            }
          )}
          title={intl.formatMessage(duplicateMessages.duplicateContentTitle, {
            name,
            trackingId: eventIndex.trackingId
          })}
        ></SubPageContent>
      </div>
      {modal}
    </>
  )
}
