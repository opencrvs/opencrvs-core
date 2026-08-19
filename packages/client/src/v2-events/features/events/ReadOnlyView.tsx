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

import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  ActionType,
  applyDraftToEventIndex,
  FieldConfig,
  FieldType,
  RecordForm,
  EventState,
  getActionAnnotationFields,
  getDeclaration,
  getOrThrow,
  getCurrentEventState,
  UUID,
  getAssignmentStatus,
  AssignmentStatus
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { getAnnotationForActionType } from '@client/v2-events/features/events/components/Action/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { recordAnchorDate } from '@client/v2-events/utils'
import { useAuthentication } from '@client/utils/userUtils'
import { useOnlineStatus } from '@client/utils'
import { queryClient, useTRPC } from '@client/v2-events/trpc'

import { useCanAccessEventWithScopes } from '@client/v2-events/hooks/useCanAccessEventWithScopes'
import { useRecordVersions } from '@client/v2-events/features/events/useRecordVersions'
import { RecordVersionMenu } from '@client/v2-events/features/events/components/RecordVersionMenu'
import { RecordVersionAlert } from '@client/v2-events/features/events/components/RecordVersionAlert'
import { getChangedDeclarationDiff } from '@client/v2-events/features/events/useEvents/procedures/actions/declarationDiff'
import { removeCachedFiles } from '../files/cache'

const messages = defineMessages({
  offlineTitle: {
    id: 'v2.event.record.offline.title',
    defaultMessage: 'No connection',
    description: 'Title shown on the Record page when the user is offline'
  },
  offlineDescription: {
    id: 'v2.event.record.offline.description',
    defaultMessage:
      'This record has not been downloaded yet so it cannot be opened offline. Please reconnect to the internet to view it.',
    description:
      'Message shown on the Record page when the user is offline and the record has not been cached locally'
  },
  recordTitle: {
    id: 'v2.event.record.title',
    defaultMessage: 'Record',
    description: 'Heading of the card on the Record tab'
  }
})

/**
 * What an informant submits with a declaration and attests to by signing it.
 * A registration can move on from that declaration through corrections the
 * informant never confirmed, so none of it carries over.
 */
function isSupportingField(field: FieldConfig) {
  return (
    field.type === FieldType.FILE ||
    field.type === FieldType.FILE_WITH_OPTIONS ||
    field.type === FieldType.SIGNATURE
  )
}

const OfflineMessageWrapper = styled.div`
  text-align: center;
`


function ReadonlyViewContent({ eventId }: { eventId: UUID }) {
  const events = useEvents()
  const event = events.getEvent.useGetOrDownloadEvent(eventId)
  const validatorContext = useValidatorContext(event)

  const maybeAuth = useAuthentication()
  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(event.id)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const currentState = useMemo(
    () => getCurrentEventState(event, configuration),
    [event, configuration]
  )

  const {
    versions,
    selected,
    selectedState,
    previousState,
    isLatest,
    selectVersion,
    showChanges,
    setShowChanges
  } = useRecordVersions({ event, configuration, currentState })

  /*
   * A draft is unsaved work on top of the current state, so it belongs to the
   * newest version only. Applying it to a historical version would show data
   * that never existed at that point.
   */
  const eventStateWithDraft = useMemo(
    () =>
      draft && isLatest
        ? applyDraftToEventIndex(selectedState, draft, configuration)
        : selectedState,
    [draft, isLatest, selectedState, configuration]
  )

  const assignmentStatus = getAssignmentStatus(
    eventStateWithDraft,
    authentication.sub
  )

  const intl = useIntl()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  /*
   * A registration shows neither supporting documents nor the signature. The
   * signature attests to the declaration as it stood, and a registration can
   * be corrected afterwards without the informant seeing it. The documents
   * stay reachable from the Documents tab.
   *
   * Filters the config rather than the values — Review decides whether to
   * render the document viewer from the config alone.
   */
  const fullFormConfig = getDeclaration(configuration)

  const formConfig = useMemo(() => {
    if (selected?.form !== RecordForm.REGISTRATION) {
      return fullFormConfig
    }

    return {
      ...fullFormConfig,
      pages: fullFormConfig.pages
        .map((page) => ({
          ...page,
          fields: page.fields.filter((field) => !isSupportingField(field))
        }))
        .filter(({ fields }) => fields.length > 0)
    }
  }, [fullFormConfig, selected?.form])

  const isRegistration = selected?.form === RecordForm.REGISTRATION

  const annotation = useMemo((): EventState | undefined => {
    // Collect annotations from all past non-READ actions that have annotation fields
    const pastActionsWithAnnotation = configuration.actions
      .filter((a) => a.type !== ActionType.READ)
      .filter((a) => getActionAnnotationFields(a).length > 0)
      .reduce<EventState>(
        (acc, actionConfig) => ({
          ...acc,
          ...getAnnotationForActionType({
            event,

            actionType: actionConfig.type,
            draft
          })
        }),
        {}
      )

    return Object.keys(pastActionsWithAnnotation).length > 0
      ? pastActionsWithAnnotation
      : undefined
  }, [configuration.actions, event, draft])

  useEffect(() => {
    return () => {
      if (assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF) {
        return
      }
      void (async () => {
        await removeCachedFiles(event)
      })()
    }
  }, [event, assignmentStatus])

  const actionConfiguration = configuration.actions.find(
    (a) => a.type === ActionType.READ
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  /*
   * The toggle is offered only when there is something to show: a previous
   * version, and at least one field that differs from it. That covers the
   * first version of a record, and a first registration — REGISTER never
   * alters declaration data, so it always matches the declaration before it.
   */
  const changed = useMemo(() => {
    if (!previousState) {
      return {}
    }

    return getChangedDeclarationDiff(
      fullFormConfig.pages.flatMap((page) => page.fields),
      eventStateWithDraft.declaration,
      previousState.declaration,
      configuration,
      validatorContext
    )
  }, [
    previousState,
    fullFormConfig,
    eventStateWithDraft,
    configuration,
    validatorContext
  ])

  const changeCount = Object.keys(changed).length

  const { title, fields } = actionConfiguration.review

  /*
   * Only signatures, not the whole of isSupportingField. An annotation belongs
   * to the action that captured it, so a file in one is evidence attached to
   * that action — a correction request, say — and that evidence does belong to
   * the registration, because the correction does. A signature captured this
   * way is still the informant confirming their declaration, so it is subject
   * to the same rule as the documents above.
   */
  const reviewFields = isRegistration
    ? fields.filter(({ type }) => type !== FieldType.SIGNATURE)
    : fields

  return (
    <ReviewComponent.Body
      readonlyMode
      alert={
        selected ? (
          <RecordVersionAlert
            changeCount={changeCount}
            selected={selected}
            showChanges={showChanges}
            versions={versions}
            onToggleChanges={() => setShowChanges(!showChanges)}
          />
        ) : undefined
      }
      anchor={recordAnchorDate(eventStateWithDraft)}
      annotation={annotation}
      content={{
        title: intl.formatMessage(messages.recordTitle),
        actions: selected
          ? [
              <RecordVersionMenu
                key="record-version"
                selected={selected}
                versions={versions}
                onSelect={selectVersion}
              />
            ]
          : []
      }}
      form={eventStateWithDraft.declaration}
      formConfig={formConfig}
      includeFieldsVisibleInPreviousForm={showChanges}
      previousFormValues={showChanges ? previousState?.declaration : undefined}
      reviewFields={reviewFields}
      showValidationErrors={isLatest}
      title={formatMessage(title, eventStateWithDraft.declaration)}
      validatorContext={validatorContext}
      onEdit={noop}
    />
  )
}

function OfflineRecordMessage() {
  const intl = useIntl()
  return (
    <Content
      size={ContentSize.SMALL}
      title={intl.formatMessage(messages.offlineTitle)}
    >
      <OfflineMessageWrapper data-testid="record-offline-message">
        {intl.formatMessage(messages.offlineDescription)}
      </OfflineMessageWrapper>
    </Content>
  )
}

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const navigate = useNavigate()
  const { canAccessEventWithScopes } = useCanAccessEventWithScopes(eventId, [
    'record.read'
  ])
  const isOnline = useOnlineStatus()
  const trpc = useTRPC()

  if (!canAccessEventWithScopes()) {
    navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }, { backTo }))
    return null
  }

  const isCachedAsView = queryClient.getQueryData([['view-event', eventId]])
  const isCachedAsAssigned = queryClient.getQueryData(
    trpc.event.get.queryKey({ eventId, waitFor: false })
  )

  // React Query pauses queries when the browser is offline, so the suspense
  // boundary inside ReadonlyViewContent would hang on a spinner forever if
  // the user opens a record they have not previously downloaded.
  // Render a clear message instead — useOnlineStatus re-renders this when
  // the connection returns, so the content loads automatically.
  if (!isOnline && !isCachedAsView && !isCachedAsAssigned) {
    return <OfflineRecordMessage />
  }

  return <ReadonlyViewContent eventId={eventId} />
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
