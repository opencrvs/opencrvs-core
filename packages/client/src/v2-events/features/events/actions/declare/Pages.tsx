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
import { ActionType, getActiveActionFormPages } from '@opencrvs/commons/client'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'

import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { isTemporaryId } from '@client/v2-events/utils'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'

import { useCurrentEventContext } from '@client/v2-events/features/events/components/Action'

export function Pages() {
  const { eventId, pageId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.PAGES)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.DECLARE.PAGES)

  const navigate = useNavigate()
  const drafts = useDrafts()
  const { modal, goToHome } = useEventFormNavigation()
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const { getFormValues, setFormValues } = useEventFormData()
  const formValues = getFormValues()
  const { config, event } = useCurrentEventContext()

  if (!config || !event) {
    throw new Error('Event not found.')
  }

  const formPages = getActiveActionFormPages(config, ActionType.DECLARE)

  const currentPageId =
    formPages.find((p) => p.id === pageId)?.id || formPages[0]?.id

  if (!currentPageId) {
    throw new Error('Form does not have any pages')
  }

  useEffect(() => {
    if (pageId !== currentPageId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
          eventId,
          pageId: currentPageId
        }),
        { replace: true }
      )
    }
  }, [pageId, currentPageId, navigate, eventId])

  /*
   * If the event had a temporary ID and the record got persisted while the user
   * was on the declare page, we need to navigate to the event with the canonical
   * ID.
   */
  useEffect(() => {
    const hasTemporaryId = isTemporaryId(event.id)

    if (eventId !== event.id && !hasTemporaryId) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.buildPath({
          eventId: event.id
        })
      )
    }
  }, [event.id, eventId, navigate])

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.DECLARE}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          goToHome()
        })
      }
    >
      {modal}
      <PagesComponent
        form={formValues}
        formPages={formPages}
        pageId={currentPageId}
        setFormData={(data) => setFormValues(data)}
        showReviewButton={searchParams.from === 'review'}
        onFormPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
              eventId,
              pageId: nextPageId
            })
          )
        }
        onSubmit={() =>
          navigate(ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({ eventId }))
        }
      />
      {saveAndExitModal}
    </FormLayout>
  )
}
