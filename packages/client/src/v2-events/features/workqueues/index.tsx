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
import { push } from 'connected-react-router'

import React from 'react'

import {
  Frame,
  AppBar,
  Stack,
  Button,
  Icon,
  Content,
  LeftNavigation,
  NavigationGroup,
  NavigationItem,
  ContentSize,
  SearchTool,
  Text
} from '@opencrvs/components'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import { Plus } from '@opencrvs/components/src/icons'
import { V2_EVENTS_ROUTE } from '@client/v2-events/routes'
import { useDispatch } from 'react-redux'

export const Workqueues = () => {
  const dispatch = useDispatch()
  return (
    <Frame
      navigation={
        <LeftNavigation
          applicationName="OpenCRVS-TS (Tennis club)"
          applicationVersion="0.1-alpha"
        >
          <NavigationGroup>
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'purple'} />}
              label="In progress"
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'orange'} />}
              label="Ready for review"
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'red'} />}
              label="Requires updates"
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'grey'} />}
              label="Sent for approval"
            />
            <NavigationItem
              icon={() => <DeclarationIconSmall color={'green'} />}
              label="Ready to print"
            />
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
                  dispatch(push(V2_EVENTS_ROUTE))
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
      <Content size={ContentSize.LARGE} title="Welcome">
        <Text variant="h2" element="p">
          🚧🚧🚧🚧🚧🚧🚧🚧👷‍♂️👷👷🏻👷🏻‍♀️👷‍♂️👷‍♂️🚧🚧🚧🚧🚧🚧🚧🚧
        </Text>
      </Content>
    </Frame>
  )
}
