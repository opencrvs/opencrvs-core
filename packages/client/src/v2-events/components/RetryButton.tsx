/* eslint-disable import/order */
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
import { Button } from '@opencrvs/components/lib/Button'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { EventIndex } from '@opencrvs/commons/client'
import { useOutbox } from '../features/events/useEvents/outbox'
import { Mutation, useQueryClient } from '@tanstack/react-query'

const RetryAction = styled(Button)`
  height: 40px;
  width: 100%;
  & > div {
    padding: 0px 0px;
  }
`

const messages = defineMessages({
  retryButtonLabel: {
    defaultMessage: 'Retry',
    description: 'Label for retry button for outbox',
    id: 'v2.event.action.outbox-retry.label'
  }
})

export default function RetryButton({ event }: { event: EventIndex }) {
  const intl = useIntl()
  const outbox = useOutbox()
  const queryClient = useQueryClient()

  const hasActionFailed = outbox.some(
    (failedEvent) => failedEvent.id === event.id
  )

  const mutations = queryClient.getMutationCache().findAll({
    status: 'pending',
    predicate: (mutation) =>
      typeof mutation.state.variables === 'object' &&
      mutation.state.variables !== null &&
      'eventId' in mutation.state.variables &&
      mutation.state.variables.eventId === event.id
  })

  const handleRetry = () => {
    mutations.forEach(async (m) => {
      await m.execute(m.state.variables)
    })
  }

  return hasActionFailed ? (
    <RetryAction type="primary" onClick={handleRetry}>
      {intl.formatMessage(messages.retryButtonLabel)}
    </RetryAction>
  ) : null
}
