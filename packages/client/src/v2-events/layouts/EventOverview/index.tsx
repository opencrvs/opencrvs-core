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
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import styled from 'styled-components'
import {
  applyDraftToEventIndex,
  deepDropNulls,
  EventConfig,
  EventIndex,
  EventStatus
} from '@opencrvs/commons/client'
import {
  APP_BAR_HEIGHT,
  AppBar,
  Button,
  Frame,
  Stack,
  Icon
} from '@opencrvs/components'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ActionMenu } from '@client/v2-events/features/workqueues/EventOverview/components/ActionMenu'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { ROUTES } from '@client/v2-events/routes'
import { flattenEventIndex } from '@client/v2-events/utils'
import { DownloadButton } from '@client/v2-events/components/DownloadButton'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { EventOverviewProvider } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { constantsMessages } from '@client/i18n/messages/constants'
import { useLocations } from '@client/v2-events/hooks/useLocations'

const Tab = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.supportingCopy};
  ${({ theme }) => theme.fonts.bold16};
  cursor: pointer;
  height: 100%;
  box-sizing: border-box;

  &:hover {
    color: ${({ theme }) => theme.colors.copy};
  }

  &.active {
    color: ${({ theme }) => theme.colors.copy};
    border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
    border-top: 3px solid transparent;
  }
`

const TabContainer = styled(Stack)`
  height: ${APP_BAR_HEIGHT};
`

const messages = defineMessages({
  record: {
    id: 'events.overview.tabs.record',
    defaultMessage: 'Record'
  },
  audit: {
    id: 'events.overview.tabs.audit',
    defaultMessage: 'Audit'
  }
})

function EventOverviewTabs({
  configuration,
  event
}: {
  configuration: EventConfig
  event: EventIndex
}) {
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT)
  const [{ workqueue }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT)

  const isActive = (pattern: string) => {
    return !!matchPath({ path: pattern, end: true }, location.pathname)
  }

  return (
    <TabContainer gap={16}>
      <Tab
        className={isActive(ROUTES.V2.EVENTS.EVENT.path) ? 'active' : ''}
        onClick={() => {
          navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }, { workqueue }))
        }}
      >{`${intl.formatMessage(configuration.label)} • ${event.trackingId}`}</Tab>
      <Tab
        className={isActive(ROUTES.V2.EVENTS.EVENT.RECORD.path) ? 'active' : ''}
        onClick={() => {
          navigate(
            ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({ eventId }, { workqueue })
          )
        }}
      >
        {intl.formatMessage(messages.record)}
      </Tab>
      <Tab
        className={isActive(ROUTES.V2.EVENTS.EVENT.AUDIT.path) ? 'active' : ''}
        onClick={() => {
          navigate(
            ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({ eventId }, { workqueue })
          )
        }}
      >
        {intl.formatMessage(messages.audit)}
      </Tab>
    </TabContainer>
  )
}

const ExitButtonContainer = styled.div`
  border-left: 1px solid ${({ theme }) => theme.colors.grey200};
  padding-left: 8px;
  margin-left: 6px;
`

export function EventOverviewLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT)
  const [{ workqueue }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT)
  const { searchEventById } = useEvents()
  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(eventId)
  const { getUser } = useUsers()
  const users = getUser.getAllCached()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const eventResults = searchEventById.useSuspenseQuery(eventId)

  const navigate = useNavigate()
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()

  if (eventResults.total === 0) {
    throw new Error(`Event details with id ${eventId} not found`)
  }

  const event = eventResults.results[0]

  const { eventConfiguration } = useEventConfiguration(event.type)
  const eventIndexWithDraftApplied = draft
    ? applyDraftToEventIndex(event, draft, eventConfiguration)
    : event

  const isDraft = event.status === EventStatus.enum.CREATED

  const exit = () => {
    if (workqueue) {
      navigate(ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue }))
      return
    }

    navigate(ROUTES.V2.buildPath({}))
  }

  return (
    <Frame
      header={
        <AppBar
          desktopLeft={
            <EventOverviewTabs
              configuration={eventConfiguration}
              event={event}
            />
          }
          desktopRight={
            <Stack>
              <ActionMenu eventId={eventId} />
              <DownloadButton
                key={`DownloadButton-${eventId}`}
                event={eventIndexWithDraftApplied}
                isDraft={isDraft}
              />
              <ExitButtonContainer>
                <Button
                  data-testid="exit-event"
                  size="small"
                  type="icon"
                  onClick={exit}
                >
                  <Icon name="X" />
                </Button>
              </ExitButtonContainer>
            </Stack>
          }
          mobileLeft={
            <Button type={'icon'} onClick={exit}>
              <Icon name="X" />
            </Button>
          }
          mobileRight={
            <>
              <ActionMenu eventId={eventId} />
              <DownloadButton
                key={`DownloadButton-${eventId}`}
                event={eventIndexWithDraftApplied}
                isDraft={isDraft}
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
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <EventOverviewProvider locations={locations} users={users}>
        {children}
      </EventOverviewProvider>
    </Frame>
  )
}
