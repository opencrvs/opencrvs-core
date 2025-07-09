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

const wasOffline = localStorage.getItem('offline') === 'true'

onlineManager.setOnline(!wasOffline)

export function Debug() {
  useEffect(() => {
    onlineManager.subscribe(() => {
      localStorage.setItem('offline', (!onlineManager.isOnline()).toString())
    })

    setTimeout(() => {
      /*
       * This just forces rerender of the the DevTools
       */
      onlineManager.setOnline(wasOffline)
      onlineManager.setOnline(!wasOffline)
    }, 100)
  }, [])

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
