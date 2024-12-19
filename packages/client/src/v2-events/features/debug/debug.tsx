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
import { useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { Text } from '@opencrvs/components'
import { useFileUpload } from '@client/v2-events/features/files/useFileUpload'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useOnlineStatus } from '@client/utils'
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

  const { filename, uploadFiles, getFullURL } = useFileUpload('test')

  function createEvents() {
    return createMutation.mutate(
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

  useEffect(() => {
    async function fetchEvents() {
      if (filename) {
        const res = await fetch(getFullURL(filename))
        // eslint-disable-next-line no-console
        console.log(res)
        // eslint-disable-next-line no-console
        console.log(await res.text())
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchEvents()
  }, [getFullURL, filename])

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
          <li>
            <br />
            <Text element="span" variant="reg12">
              Test file uploads
            </Text>
            <br />
            <input
              type="file"
              onChange={(e) => e.target.files && uploadFiles(e.target.files[0])}
            />
          </li>
        </ul>
      </Container>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
