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
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { EventIndex } from '@opencrvs/commons/client'
import {
  useFailedMutationStore,
  useOutbox
} from '../features/events/useEvents/outbox'
import { useMutation } from '@tanstack/react-query'

const RetryAction = styled(Button)`
  height: 40px;
  width: 100%;
  & > div {
    padding: 0px 0px;
  }
`

const retryButtonLabel = {
  defaultMessage: 'Retry',
  description: 'Label for retry button for outbox',
  id: 'v2.event.action.outbox-retry.label'
}

export default function RetryButton({ event }: { event: EventIndex }) {
  const { failed } = useOutbox()
  const intl = useIntl()
  const { failedMutations, removeFailedMutation } = useFailedMutationStore()

  const hasActionFailed = failed.some(
    (failedEvent) => failedEvent.id === event.id
  )

  const matchingMutation = failedMutations.find(
    (mutation) => mutation.eventId === event.id
  )

  const mutation = useMutation({
    mutationKey: matchingMutation?.mutationKey
  })

  const handleRetry = async () => {
    if (matchingMutation) {
      try {
        await mutation.mutateAsync(matchingMutation.variables)
        removeFailedMutation(event.id, event.type)
      } catch (err) {
        throw new Error('Cannot retry')
      }
    } else {
      console.warn('No matching mutation found for retry')
    }
  }

  return hasActionFailed ? (
    <RetryAction type="primary" onClick={handleRetry}>
      {intl.formatMessage(retryButtonLabel)}
    </RetryAction>
  ) : null
}
