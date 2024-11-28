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

import {
  Frame,
  AppBar,
  Stack,
  Button,
  Icon,
  Content,
  ContentSize,
  RadioGroup,
  RadioSize
} from '@opencrvs/components'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'

import { V2_EVENT_ROUTE } from '@client/v2-events/routes/routes'
import { formatUrl } from './utils'
import { EventConfig } from '@opencrvs/commons'

export const Events = () => {
  const dispatch = useDispatch()

  const events: EventConfig[] = [
    {
      id: 'tennis-club-membership',
      label: {
        id: 'tennis-club-membership',
        defaultMessage: 'Tennis club (regular)',
        description: 'Event type for tennis club membership applications'
      },
      actions: []
    },
    {
      id: 'tennis-club-membership-2',
      label: {
        id: 'tennis-club-membership-2',
        defaultMessage: 'Tennis club (plus)',
        description: 'Event type for tennis club membership applications'
      },
      actions: []
    },
    {
      id: 'tennis-club-membership-3',
      label: {
        id: 'tennis-club-membership-3',
        defaultMessage: 'Tennis club (diamond)',
        description: 'Event type for tennis club membership applications'
      },
      actions: []
    }
  ]

  const [selectedEvent, setSelectedEvent] = React.useState<string>()

  return (
    <Frame
      header={
        <AppBar
          title="OpenCRVS"
          desktopLeft="Declaration"
          desktopRight={
            <Button type="secondary" onClick={() => {}}>
              <Icon name="X" />
              Exit
            </Button>
          }
        />
      }
      skipToContentText="Skip to main content"
    >
      <Frame.Layout>
        <Frame.Section>
          <Content size={ContentSize.SMALL} title="Event type">
            <Stack direction="column">
              <RadioGroup
                size={RadioSize.LARGE}
                value={selectedEvent as string}
                onChange={(value) => setSelectedEvent(value)}
                options={events.map((event) => ({
                  value: event.id,
                  label: event.label.defaultMessage
                }))}
              />
              <Button
                fullWidth
                type="primary"
                disabled={!selectedEvent}
                onClick={() => {
                  if (selectedEvent) {
                    dispatch(
                      push(
                        formatUrl(V2_EVENT_ROUTE, {
                          eventType: selectedEvent
                        })
                      )
                    )
                  }
                }}
              >
                Continue
              </Button>
            </Stack>
          </Content>
        </Frame.Section>
      </Frame.Layout>
    </Frame>
  )
}
