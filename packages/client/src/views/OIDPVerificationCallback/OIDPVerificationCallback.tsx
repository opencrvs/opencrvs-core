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
import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router'
import { useQueryParams } from './utils'

// OIDP Verification Callback
// --
// Checks the ?state= query parameter for a JSON string like: { pathname: "/path/somewhere" }
// Checks that the &nonce= parameter matches the one in localStorage, removes it if yes, throws if not
// Redirects to the pathname in state

export const OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY =
  'oidp-verification-nonce'

const useCheckNonce = () => {
  const params = useQueryParams()
  const [nonceOk, setNonceOk] = useState(false)

  useEffect(() => {
    if (!params.get('nonce')) {
      throw new Error('No nonce provided from OIDP callback.')
    }

    const nonceMatches =
      window.localStorage.getItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY) ===
      params.get('nonce')

    if (nonceMatches) {
      window.localStorage.removeItem(OIDP_VERIFICATION_NONCE_LOCALSTORAGE_KEY)
      setNonceOk(true)
    } else {
      throw new Error(
        'Nonce did not match the one sent to the integration before callback'
      )
    }
  }, [params])

  return nonceOk
}

const useRedirectPathname = () => {
  const params = useQueryParams()

  useEffect(() => {
    if (!params.get('state')) {
      throw new Error('No state provided from OIDP callback.')
    }
  }, [params])

  const { pathname } = JSON.parse(params.get('state') ?? '{}') as {
    pathname: string | undefined
  }

  return { pathname }
}

export const OIDPVerificationCallback = () => {
  const params = useQueryParams()
  const { pathname } = useRedirectPathname()
  const isNonceOk = useCheckNonce()

  if (!pathname || !isNonceOk) {
    // Do not redirect and let the hooks throw
    return null
  }

  return (
    <Redirect
      to={{
        pathname,
        state: {
          code: params.get('code')
        }
      }}
    />
  )
}
