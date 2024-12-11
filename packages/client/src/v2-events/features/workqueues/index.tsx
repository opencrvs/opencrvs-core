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

import { Debug } from '@client/v2-events/features/debug/debug'
import {
  Frame,
  AppBar,
  Stack,
  Button,
  Icon,
  LeftNavigation,
  NavigationGroup,
  NavigationItem,
  SearchTool
} from '@opencrvs/components'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { Plus } from '@opencrvs/components/src/icons'
import { ROUTES } from '@client/v2-events/routes'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEvents } from '@client/v2-events/features/events/useEvents'
import groupBy from 'lodash-es/groupBy'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useIntlFormatMessageWithFlattenedParams } from './utils'
import sumBy from 'lodash-es/sumBy'

const colors = ['green', 'orange', 'red', 'teal', 'grey', 'purple']

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */
export const Workqueues = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const intl = useIntlFormatMessageWithFlattenedParams()

  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUE)

  const { getEvents } = useEvents()
  const events = getEvents.useQuery()

  const [config] = useEventConfigurations()

  const createQueueUrl = (id: string) =>
    ROUTES.V2.WORKQUEUE.buildPath(
      {},
      {
        id
      }
    )

  const eventsByStatus = groupBy(events.data, (event) => event.status)

  return (
    <Frame
      navigation={
        <LeftNavigation
          applicationName="OpenCRVS-TS (Tennis club)"
          applicationVersion="0.1-alpha"
        >
          <NavigationGroup>
            {config.workqueues.map((workqueue, i) => {
              const statuses = workqueue.filters.flatMap(
                (filter) => filter.status
              )
              const count = sumBy(
                statuses,
                (status) => eventsByStatus[status]?.length ?? 0
              )

              return (
                <NavLink
                  to={createQueueUrl(workqueue.id)}
                  key={workqueue.title.id}
                >
                  {(props) => (
                    <NavigationItem
                      isSelected={
                        props.isActive && searchParams.id === workqueue.id
                      }
                      icon={() => <DeclarationIconSmall color={colors[i]} />}
                      label={intl.formatMessage(workqueue.title)}
                      count={count}
                    />
                  )}
                </NavLink>
              )
            })}
          </NavigationGroup>
          <NavigationGroup>
            <NavigationItem
              icon={() => <Icon name="Buildings" size="medium" />}
              label="Organisation"
            />
            <NavigationItem
              icon={() => <Icon name="Users" size="medium" />}
              label="Team"
            />
            <NavigationItem
              icon={() => <Icon name="Activity" size="medium" />}
              label="Performance"
            />
          </NavigationGroup>
        </LeftNavigation>
      }
      skipToContentText="skip"
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
                searchTypeList={[
                  {
                    name: 'TRACKING_ID',
                    label: 'Tracking ID',
                    icon: <Icon name="MagnifyingGlass" size="small" />,
                    placeHolderText: 'Search'
                  }
                ]}
                searchHandler={() => {}}
              />
            </Stack>
          }
        />
      }
    >
      {children}
      <Debug />
    </Frame>
  )
}
