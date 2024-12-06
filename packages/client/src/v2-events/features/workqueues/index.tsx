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
import { EventStatus } from '@events/schema/EventIndex'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */
export const Workqueues = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  const [searchParams] = useTypedSearchParams(ROUTES.V2.EVENTS.VIEW)

  const { getEvents } = useEvents()
  const events = getEvents.useQuery()

  const createQueueUrl = (status: EventStatus) =>
    ROUTES.V2.EVENTS.VIEW.buildPath(
      {},
      {
        status
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
          {/* @TODO: Consider mapping through these once we know the mapping.
            Currently it seems we would need to give that through configuration.
          */}
          <NavigationGroup>
            <NavLink to={createQueueUrl(EventStatus.CREATED)}>
              {(props) => (
                <NavigationItem
                  isSelected={
                    props.isActive &&
                    searchParams.status === EventStatus.CREATED
                  }
                  icon={() => <DeclarationIconSmall color={'purple'} />}
                  label="In progress"
                  count={eventsByStatus[EventStatus.CREATED]?.length}
                />
              )}
            </NavLink>
            <NavLink to={createQueueUrl(EventStatus.DECLARED)}>
              {(props) => (
                <NavigationItem
                  isSelected={
                    props.isActive &&
                    searchParams.status === EventStatus.DECLARED
                  }
                  icon={() => <DeclarationIconSmall color={'teal'} />}
                  label="Ready for review"
                  count={eventsByStatus[EventStatus.DECLARED]?.length}
                />
              )}
            </NavLink>
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'orange'} />}
              label="Requires updates"
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'grey'} />}
              label="Sent for approval"
            />
            <NavLink to={createQueueUrl(EventStatus.REGISTERED)}>
              {(props) => (
                <NavigationItem
                  isSelected={
                    props.isActive &&
                    searchParams.status === EventStatus.REGISTERED
                  }
                  icon={() => <DeclarationIconSmall color={'green'} />}
                  label="Ready to print"
                  count={eventsByStatus[EventStatus.REGISTERED]?.length}
                />
              )}
            </NavLink>
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'blue'} />}
              label="Ready to issue"
            />
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
