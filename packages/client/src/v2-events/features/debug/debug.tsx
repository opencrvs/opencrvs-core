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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { onlineManager } from '@tanstack/react-query'

import React, { useEffect } from 'react'
import styled from 'styled-components'

const wasOffline = localStorage.getItem('debugger-offline') === 'true'

onlineManager.setOnline(!wasOffline)

/*
 * React query Devtool assumes offline mode is never set from outside
 * thus the button's state always first defaults to online.
 * As we're setting the mode offline even before the component mounts,
 * we need to override the default styles to indicate that the app is offline.
 * This is a workaround for the issue.
 */
const Container = styled.div<{ isOnline: boolean }>`
  ${({ isOnline }) =>
    !isOnline &&
    `
    .tsqd-action-mock-offline-behavior svg {
      fill: #f79009;
      stroke: #f79009;
    }
  `}
`

export function Debug() {
  const [isOnline, setOnline] = React.useState(onlineManager.isOnline())
  useEffect(() => {
    onlineManager.subscribe(() => {
      const online = onlineManager.isOnline()
      setOnline(online)
      localStorage.setItem('debugger-offline', (!online).toString())
    })
  }, [isOnline])

  return (
    <Container isOnline={isOnline}>
      <ReactQueryDevtools initialIsOpen={false} />
    </Container>
  )
}
