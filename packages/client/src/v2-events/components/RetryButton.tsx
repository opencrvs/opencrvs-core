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
import {
  useFailedMutationStore,
  useOutbox
} from '../features/events/useEvents/outbox'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '../trpc'

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
  const { failed } = useOutbox()
  const intl = useIntl()
  const { failedMutations, removeFailedMutation } = useFailedMutationStore()

  const hasActionFailed = failed.some(
    (failedEvent) => failedEvent.id === event.id
  )

  const matchingMutation = failedMutations.find((m) => m.eventId === event.id)
  const mutationKey = matchingMutation?.mutationKey

  const mutationDefaults = mutationKey
    ? queryClient.getMutationDefaults(mutationKey)
    : undefined

  const mutation = useMutation({
    mutationKey,
    mutationFn: mutationDefaults?.mutationFn,
    onSuccess: mutationDefaults?.onSuccess,
    onError: mutationDefaults?.onError,
    retry: mutationDefaults?.retry,
    retryDelay: mutationDefaults?.retryDelay,
    meta: mutationDefaults?.meta
  })

  const handleRetry = async () => {
    if (matchingMutation) {
      try {
        await mutation.mutateAsync(matchingMutation.variables)
        removeFailedMutation(event.id)
      } catch (err) {
        throw new Error(`Mutation failed again due to ${err}`)
      }
    } else {
      throw new Error('No matching mutation found for retry')
    }
  }

  return hasActionFailed ? (
    <RetryAction type="primary" onClick={handleRetry}>
      {intl.formatMessage(messages.retryButtonLabel)}
    </RetryAction>
  ) : null
}
