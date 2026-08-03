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
import {
  ActionType,
  EventIndex,
  getActionConfig,
  getUUID,
  isActionEnabled,
  isActionVisible
} from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { ROUTES } from '@client/v2-events/routes/routes'
import { useEventConfigurationForEvent } from '../../useEventConfiguration'
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

  const [{ backTo }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE
  )

  const intl = useIntl()

  const { actions, customActions } = useEvents()

  const navigate = useNavigate()
  const { getEventTitle } = useEventTitle()

  const { eventConfiguration: configuration } =
    useEventConfigurationForEvent(eventIndex)
  const validatorContext = useValidatorContext()

  const [modal, openModal] = useModal()

  const { title: name } = getEventTitle(configuration, eventIndex)

  const trackingIds = eventIndex.potentialDuplicates
    .map((duplicate) => duplicate.trackingId)
    .join(', ')

  const markAsNotDuplicateActionConfig = getActionConfig({
    eventConfiguration: configuration,
    actionType: ActionType.MARK_AS_NOT_DUPLICATE
  })

  const notADuplicateVisible = markAsNotDuplicateActionConfig
    ? isActionVisible(
        markAsNotDuplicateActionConfig,
        eventIndex,
        validatorContext
      )
    : true
  const notADuplicateEnabled = markAsNotDuplicateActionConfig
    ? isActionEnabled(
        markAsNotDuplicateActionConfig,
        eventIndex,
        validatorContext
      )
    : true

  // `archiveOnDuplicate` is a client-side combinator that fires the core
  // MARK_AS_DUPLICATE action (then ARCHIVE) — see custom-api/index.ts.
  // Configured labels/icons only affect the action menu entry that navigates
  // here; this core-owned review page keeps hardcoded button labels/icons,
  // while the configs' conditionals still gate visibility/enabling.
  const markAsDuplicateActionConfig = getActionConfig({
    eventConfiguration: configuration,
    actionType: ActionType.MARK_AS_DUPLICATE
  })
  const markAsDuplicateVisible = markAsDuplicateActionConfig
    ? isActionVisible(markAsDuplicateActionConfig, eventIndex, validatorContext)
    : true
  const markAsDuplicateEnabled = markAsDuplicateActionConfig
    ? isActionEnabled(markAsDuplicateActionConfig, eventIndex, validatorContext)
    : true

  const notADuplicateButton = notADuplicateVisible && (
    <Button
      key="btn-not-a-duplicate"
      fullWidth
      disabled={!notADuplicateEnabled}
      id="not-a-duplicate"
      type="positive"
      onClick={async () => {
        const markAsNotDuplicate = await openModal<boolean>((close) => (
          <MarkAsNotDuplicateModal
            close={close}
            name={name || ''}
            trackingId={eventIndex.trackingId}
          />
        ))
        if (markAsNotDuplicate) {
          actions.duplicate.markNotDuplicate.mutate({
            transactionId: getUUID(),
            eventId: eventIndex.id,
            keepAssignment: true,
            waitFor: false
          })

          navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }))
        }
      }}
    >
      <Icon name="NotePencil" />
      {intl.formatMessage(duplicateMessages.notDuplicateButton)}
    </Button>
  )

  const markAsDuplicateButton = markAsDuplicateVisible && (
    <Button
      key="btn-mark-as-duplicate"
      fullWidth
      disabled={!markAsDuplicateEnabled}
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

          if (backTo) {
            navigate(backTo)
          } else {
            navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }))
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
          bottomActionButtons={[
            notADuplicateButton,
            markAsDuplicateButton
          ].filter((button): button is React.ReactElement => Boolean(button))}
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
