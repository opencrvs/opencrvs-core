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
  Button,
  Icon,
  Content,
  ContentSize,
  FormWizard,
  Values,
  Spinner
} from '@opencrvs/components'
import { V2_EVENT_ROUTE } from '@client/v2-events/routes/routes'

import { trpc } from '@client/v2-events/trcp'
import { formatUrl } from './utils'
import { useHistory } from 'react-router-dom'
import { RadioGroup } from './registered-fields/RadioGroup'

export const Events = () => {
  const history = useHistory()
  const { data, isLoading } = trpc.config.get.useQuery()

  const events = data ?? []

  const onSubmit = ({ eventType }: Values) => {
    if (eventType) {
      history.push(
        formatUrl(V2_EVENT_ROUTE, {
          eventType
        })
      )
    }
  }

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
            {isLoading ? (
              <Spinner id="event-type-spinner" />
            ) : (
              <FormWizard
                currentPage={0}
                pages={[
                  {
                    fields: [
                      {
                        name: 'eventType',
                        type: 'RADIO_GROUP',
                        required: true,
                        label: {
                          defaultMessage: 'Select an event',
                          description: 'Select an event',
                          id: 'event.select.label'
                        },
                        options: events.map((event) => ({
                          value: event.id,
                          label: event.label.defaultMessage
                        }))
                      }
                    ]
                  }
                ]}
                components={{
                  RADIO_GROUP: RadioGroup
                }}
                defaultValues={{
                  eventType: events[0]?.id
                }}
                onSubmit={onSubmit}
              />
            )}
          </Content>
        </Frame.Section>
      </Frame.Layout>
    </Frame>
  )
}
