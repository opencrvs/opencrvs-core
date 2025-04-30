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
import {
  AppBar,
  Button,
  Frame,
  Icon,
  SearchTool,
  Stack
} from '@opencrvs/components'
import { Plus } from '@opencrvs/components/src/icons'
import { ROUTES } from '@client/v2-events/routes'

/**
 * Basic frame for the workqueues. Includes the left navigation and the app bar.
 */
export function WorkqueueLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

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
        />
      }
      skipToContentText="skip"
    >
      {children}
    </Frame>
  )
}
