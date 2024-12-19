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
/* stylelint-disable */
import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import styled from 'styled-components'
import { useQueryClient } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { Text } from '@opencrvs/components'
import { useOnlineStatus } from '@client/utils'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'

/* Debug file should be the only transient component which will not be present in near future. */
/* eslint-disable react/jsx-no-literals */

const Container = styled.div`
  background: #fff;
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  padding: 16px;
  border: 1px dashed #00c142;
  ul {
    list-style: none;
    padding: 0;
  }
`

export function Debug() {
  const events = useEvents()
  const online = useOnlineStatus()
  const queryClient = useQueryClient()
  const createMutation = events.createEvent()

  const createEvents = () => {
    createMutation.mutate(
      {
        type: 'TENNIS_CLUB_MEMBERSHIP',
        transactionId: `tmp-${uuid()}`
      },
      {
        onSuccess: (data) => {
          // eslint-disable-next-line no-console
          console.log('Event created', data)
        },
        onError: (error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to create event', error)
        }
      }
    )
  }

  const mutations = queryClient.getMutationCache().getAll()
  const storedEvents = events.events
  return (
    <>
      <Container>
        <ul>
          <li>
            <Text element="span" variant="reg12">
              {online ? 'Online' : 'Offline'}
            </Text>
          </li>
          <li>
            <button onClick={createEvents}>Create event</button>
          </li>
          <li>
            <Text element="span" variant="reg12">
              Failed requests in cache{' '}
              {mutations
                .filter((mutation) => mutation.state.isPaused)
                .length.toString()}
            </Text>
          </li>
          <li>
            <Text element="span" variant="reg12">
              Paused requests in cache{' '}
              {mutations
                .filter((mutation) => mutation.state.error)
                .length.toString()}
            </Text>
          </li>
          <li>
            <button onClick={() => queryClient.clear()}>
              Clear React Query buffer
            </button>
          </li>
          <li>
            {/* eslint-disable-next-line no-console */}
            <button onClick={() => console.log(events.events.data)}>
              console.log stored events
            </button>
          </li>
          <li>
            <Text element="span" variant="reg12">
              Events in offline storage: {storedEvents.data.length}
            </Text>
          </li>
        </ul>
        <Text element="span" variant="h4">
          Local records
        </Text>
      </Container>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
