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

import { noop } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useIntl, defineMessages } from 'react-intl'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  AppBar,
  Button,
  Frame,
  Icon,
  INavigationType,
  SearchTool,
  Stack
} from '@opencrvs/components'
import { Plus } from '@opencrvs/components/src/icons'
import { getOrThrow } from '@opencrvs/commons/client'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { ROUTES } from '@client/v2-events/routes'
import { ProfileMenu } from '@client/components/ProfileMenu'
import {
  useEventConfiguration,
  useEventConfigurations
} from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { getEventTitle } from '@client/v2-events/utils'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { ActionMenu } from '@client/v2-events/features/workqueues/EventOverview/components/ActionMenu'

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */

const messagesToDefine = {
  header: {
    id: 'home.header.advancedSearch',
    defaultMessage: 'Advanced Search',
    description: 'Search menu advanced search type'
  }
}
const messages = defineMessages(messagesToDefine)

export function EventOverviewLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.OVERVIEW)
  const { getEvents } = useEvents()
  const [events] = getEvents.useSuspenseQuery()
  const event = getOrThrow(
    events.find(({ id }) => id === eventId),
    `Could not find event for ${eventId}`
  )

  const allEvents = useEventConfigurations()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const navigate = useNavigate()
  const intl = useIntl()
  const flattenedIntl = useIntlFormatMessageWithFlattenedParams()

  const advancedSearchEvents = allEvents.filter(
    (e) => e.advancedSearch.length > 0
  )

  const advancedSearchNavigationList: INavigationType[] = [
    {
      label: intl.formatMessage(messages.header),
      id: 'advanced-search',
      onClick: () => {
        navigate(ROUTES.V2.ADVANCED_SEARCH.path)
      }
    }
  ]

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

              <SearchTool
                language="en"
                navigationList={
                  advancedSearchEvents.length > 0
                    ? advancedSearchNavigationList // only available when enable in at least one form
                    : []
                }
                searchHandler={noop}
                searchTypeList={[
                  {
                    name: 'TRACKING_ID',
                    label: 'Tracking ID',
                    icon: <Icon name="MagnifyingGlass" size="small" />,
                    placeHolderText: 'Search'
                  }
                ]}
              />
            </Stack>
          }
          desktopRight={<ProfileMenu key="profileMenu" />}
          mobileLeft={
            <Button type={'icon'} onClick={() => navigate(-1)}>
              <BackArrow />
            </Button>
          }
          mobileRight={<ActionMenu eventId={eventId} />}
          mobileTitle={getEventTitle({
            event,
            eventConfig: eventConfiguration,
            intl: flattenedIntl
          })}
        />
      }
      skipToContentText="skip"
    >
      {children}
    </Frame>
  )
}
