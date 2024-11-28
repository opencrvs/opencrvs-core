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
  RadioGroup,
  RadioSize,
  Stack,
  ErrorText
} from '@opencrvs/components'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'
import { Controller, useForm } from 'react-hook-form'
import { V2_EVENT_ROUTE } from '@client/v2-events/routes/routes'

import { trpc } from '@client/v2-events/trcp'
import { formatUrl } from './utils'

type SelectEventForm = {
  eventType: string
}

export const Events = () => {
  const dispatch = useDispatch()
  const { data, isFetching } = trpc.config.get.useQuery()

  const events = data ?? []

  const { handleSubmit, control, formState } = useForm<SelectEventForm>()

  const errorMessage = formState.errors.eventType
    ? 'Please select an event'
    : ''

  const onSubmit = ({ eventType }: SelectEventForm) => {
    if (eventType) {
      dispatch(
        push(
          formatUrl(V2_EVENT_ROUTE, {
            eventType
          })
        )
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
            <form onSubmit={handleSubmit(onSubmit)}>
              {!!errorMessage && <ErrorText>{errorMessage}</ErrorText>}
              <Stack direction="column" gap={24}>
                <Controller
                  name="eventType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <RadioGroup
                      size={RadioSize.LARGE}
                      options={events.map((event) => ({
                        value: event.id,
                        label: event.label.defaultMessage
                      }))}
                      {...field}
                    />
                  )}
                />
                <Button fullWidth type="primary" disabled={isFetching}>
                  Continue
                </Button>
              </Stack>
            </form>
          </Content>
        </Frame.Section>
      </Frame.Layout>
    </Frame>
  )
}
