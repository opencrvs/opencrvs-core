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

import { useEvents } from '@client/v2-events/features/events/useEvents'
import styled from 'styled-components'

const Container = styled.div`
  background: #fff;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 16px;
  border: 1px dashed #00c142;
  ul {
    list-style: none;
    padding: 0;
  }
`

export const Debug = () => {
  const events = useEvents()

  const createMutation = events.createEvent()

  const createEvents = () => {
    createMutation.mutate(
      {
        type: 'TENNIS_CLUB_MEMBERSHIP',
        transactionId: Math.random().toString(36).substring(2)
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

  return (
    <Container>
      <ul>
        <li>
          <button onClick={createEvents}>Create event</button>
        </li>
      </ul>
    </Container>
  )
}
