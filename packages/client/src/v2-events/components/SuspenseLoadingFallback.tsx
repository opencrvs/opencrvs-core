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
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import { Spinner } from '@opencrvs/components'
import { ConnectionError } from '@opencrvs/components/lib/icons'
import { useOnlineStatus } from '@client/utils'

const messages = defineMessages({
  offlineTitle: {
    id: 'v2.suspense.offline.title',
    defaultMessage: 'No connection',
    description: 'Title shown on a loading screen when the user is offline'
  },
  offlineDescription: {
    id: 'v2.suspense.offline.description',
    defaultMessage:
      'This content has not been downloaded yet, so it cannot be shown offline. It will load automatically once you are back online.',
    description:
      'Message shown when a screen cannot load because the user is offline and the data has not been cached locally'
  }
})

const FullSizeWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const OfflineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 360px;
  padding: 24px;
`
const OfflineTitle = styled.h2`
  ${({ theme }) => theme.fonts.h2};
  color: ${({ theme }) => theme.colors.copy};
  margin: 16px 0 8px;
`
const OfflineDescription = styled.p`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey500};
  margin: 0;
`

/**
 * Suspense fallback used across the v2-events app.
 *
 * React Query pauses queries while the browser is offline, so a
 * `useSuspenseQuery` for data that has not been cached yet would otherwise
 * suspend forever and leave this fallback spinning indefinitely. When offline
 * we show a clear message instead; `useOnlineStatus` re-renders this when the
 * connection returns, the paused query resumes, and the content loads
 * automatically. Cached data resolves synchronously and never reaches this
 * fallback, so offline-first behaviour is preserved.
 */
export function SuspenseLoadingFallback({ id }: { id?: string }) {
  const isOnline = useOnlineStatus()
  const intl = useIntl()

  if (!isOnline) {
    return (
      <FullSizeWrapper>
        <OfflineWrapper id="suspense-offline-message">
          <ConnectionError />
          <OfflineTitle>
            {intl.formatMessage(messages.offlineTitle)}
          </OfflineTitle>
          <OfflineDescription>
            {intl.formatMessage(messages.offlineDescription)}
          </OfflineDescription>
        </OfflineWrapper>
      </FullSizeWrapper>
    )
  }

  return (
    <FullSizeWrapper>
      <Spinner id={id ?? 'page-spinner'} />
    </FullSizeWrapper>
  )
}
