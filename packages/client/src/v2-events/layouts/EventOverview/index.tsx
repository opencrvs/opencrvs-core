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
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { applyDraftToEventIndex, deepDropNulls } from '@opencrvs/commons/client'
import { AppBar, Button, Frame, Stack } from '@opencrvs/components'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { Plus } from '@opencrvs/components/src/icons'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ActionMenu } from '@client/v2-events/features/workqueues/EventOverview/components/ActionMenu'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { ROUTES } from '@client/v2-events/routes'
import { CoreWorkqueues, flattenEventIndex } from '@client/v2-events/utils'
import { SearchToolbar } from '@client/v2-events/features/events/components/SearchToolbar'
import { DownloadButton } from '@client/v2-events/components/DownloadButton'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { Sidebar } from '../sidebar/Sidebar'
/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */

export function EventOverviewLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { searchEventById } = useEvents()
  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(eventId)
  const navigate = useNavigate()
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
  const { slug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)

  const eventResults = searchEventById.useSuspenseQuery(eventId)

  if (eventResults.total === 0) {
    throw new Error(`Event details with id ${eventId} not found`)
  }

  const eventIndex = eventResults.results[0]

  const { eventConfiguration } = useEventConfiguration(eventIndex.type)
  const eventIndexWithDraftApplied = draft
    ? applyDraftToEventIndex(eventIndex, draft, eventConfiguration)
    : eventIndex

  return (
    <Frame
      header={
        <AppBar
          desktopCenter={
            <Stack gap={16}>
              <Button
                type="iconPrimary"
                onClick={() => {
                  navigate(ROUTES.V2.EVENTS.CREATE.path)
                }}
              >
                <Plus />
              </Button>
              <SearchToolbar />
            </Stack>
          }
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileLeft={
            <Button type={'icon'} onClick={() => navigate(-1)}>
              <BackArrow />
            </Button>
          }
          mobileRight={
            <>
              <ActionMenu eventId={eventId} />
              <DownloadButton
                key={`DownloadButton-${eventId}`}
                event={eventIndexWithDraftApplied}
                isDraft={slug === CoreWorkqueues.DRAFT}
              />
            </>
          }
          mobileTitle={
            flattenedIntl.formatMessage(
              eventConfiguration.title,
              flattenEventIndex(deepDropNulls(eventIndexWithDraftApplied))
            ) || intl.formatMessage(recordAuditMessages.noName)
          }
        />
      }
      navigation={<Sidebar />}
      skipToContentText="skip"
    >
      {children}
    </Frame>
  )
}
