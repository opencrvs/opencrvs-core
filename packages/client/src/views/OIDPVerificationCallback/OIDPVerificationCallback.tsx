/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import { Redirect, useParams } from 'react-router'

export const useRedirect = () => {
  const { state, nonce, code } = useParams<{
    state?: string
    nonce?: string
    code?: string
  }>()

  if (!state) {
    throw new Error('No state provided from OIDP callback.')
  }

  const { pathname } = JSON.parse(state)

  return {
    pathname,
    state: {
      nonce,
      code
    }
  }
}

export const OIDPVerificationCallback = () => {
  const { pathname, state } = useRedirect()

  return (
    <Redirect
      to={{
        pathname,
        state
      }}
    />
  )
}
