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
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  eventAttachmentPath,
  getActionForm,
  getActionReview,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { getFormBackAction } from '@client/v2-events/layouts/form/FormBackAction'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { isTemporaryId, recordAnchorDate } from '@client/v2-events/utils'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { DeclareActionMenu } from './declare/DeclareActionMenu'
import { NotifyActionMenu } from './notify/NotifyActionMenu'

/** Actions submitted through their own form flow: form pages, then a review page. */
export type FlowActionType =
  | typeof ActionType.NOTIFY
  | typeof ActionType.DECLARE

function getFlowRoute(actionType: FlowActionType) {
  return actionType === ActionType.NOTIFY
    ? ROUTES.V2.EVENTS.NOTIFY
    : ROUTES.V2.EVENTS.DECLARE
}

/** Form pages of the notify and declare flows. */
export function ActionFlowPages({
  actionType
}: {
  actionType: FlowActionType
}) {
  const route = getFlowRoute(actionType)
  const { eventId, pageId } = useTypedParams(route.PAGES)
  const [searchParams] = useTypedSearchParams(route.PAGES)
  const events = useEvents()
  const navigate = useNavigate()
  const drafts = useDrafts()
  const { modal, closeActionView } = useEventFormNavigation()
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const { getFormValues, setFormValues } = useEventFormData()
  const formValues = getFormValues()
  const event = events.getEvent.useGetEventFromCache(eventId)
  const validatorContext = useValidatorContext(event)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const pages = getActionForm(configuration, actionType).pages

  const currentPageId = pages.find((p) => p.id === pageId)?.id || pages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        route.PAGES.buildPath(
          {
            eventId,
            pageId: currentPageId
          },
          searchParams
        ),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId, searchParams, route])

  /*
   * If the event had a temporary ID and the record got persisted while the user
   * was on the form pages, we need to navigate to the event with the canonical
   * ID.
   */
  useEffect(() => {
    const hasTemporaryId = isTemporaryId(event.id)

    if (eventId !== event.id && !hasTemporaryId) {
      navigate(
        route.PAGES.buildPath(
          {
            eventId: event.id,
            pageId: currentPageId
          },
          searchParams
        )
      )
    }
  }, [currentPageId, event.id, eventId, navigate, searchParams, route])

  const onPageChange = (nextPageId: string) =>
    navigate(
      route.PAGES.buildPath({ eventId, pageId: nextPageId }, searchParams)
    )

  const backAction = getFormBackAction({
    formPages: pages,
    formData: formValues,
    validatorContext,
    pageId: currentPageId,
    onNavigateToPage: onPageChange
  })

  return (
    <FormLayout
      backAction={backAction}
      route={route}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          closeActionView(searchParams.backTo)
        })
      }
    >
      {modal}
      <PagesComponent
        attachmentPath={eventAttachmentPath(event.id)}
        eventConfig={configuration}
        formData={formValues}
        formPages={pages}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(data)}
        validatorContext={validatorContext}
        onPageChange={onPageChange}
        onSubmit={() =>
          navigate(
            route.REVIEW.buildPath({ eventId }, { backTo: searchParams.backTo })
          )
        }
      />
      {saveAndExitModal}
    </FormLayout>
  )
}

/** Review page of the notify and declare flows. */
export function ActionFlowReview({
  actionType
}: {
  actionType: FlowActionType
}) {
  const route = getFlowRoute(actionType)
  const { eventId } = useTypedParams(route.REVIEW)
  const [{ backTo }] = useTypedSearchParams(route.REVIEW)
  const events = useEvents()
  const navigate = useNavigate()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const event = events.getEvent.useGetEventFromCache(eventId)
  const validatorContext = useValidatorContext(event)
  const { eventConfiguration: config } = useEventConfiguration(event.type)
  const formConfig = getActionForm(config, actionType)
  const reviewConfig = getActionReview(config, actionType)

  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  const anchor = recordAnchorDate(getCurrentEventState(event, config))
  const form = useEventFormData((state) => state.getFormValues())
  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  function handleEdit({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) {
    navigate(
      route.PAGES.buildPath(
        { pageId, eventId },
        {
          from: 'review',
          backTo
        },
        fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
      )
    )
  }

  return (
    <FormLayout
      actionComponent={
        actionType === ActionType.NOTIFY ? (
          <NotifyActionMenu event={event} />
        ) : (
          <DeclareActionMenu event={event} />
        )
      }
      route={route}
    >
      <ReviewComponent.Body
        anchor={anchor}
        annotation={annotation}
        attachmentPath={eventAttachmentPath(eventId)}
        form={form}
        formConfig={formConfig}
        reviewFields={reviewConfig.fields}
        title={formatMessage(reviewConfig.title, form)}
        validatorContext={validatorContext}
        onAnnotationChange={(values) => setAnnotation(values)}
        onEdit={handleEdit}
      />
    </FormLayout>
  )
}
