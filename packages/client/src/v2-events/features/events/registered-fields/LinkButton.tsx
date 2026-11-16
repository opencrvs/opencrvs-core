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
import { useIntl } from 'react-intl'
import { LinkButtonField } from '@opencrvs/commons/client'
import { Button, Icon } from '@opencrvs/components'
import { useOnlineStatus } from '@client/utils'
import { throwIfUnsupportedIcon } from './Button'

export function getCleanRedirectURI() {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

function setRedirectURI(url: string) {
  const parsed = new URL(url)
  if (!parsed.searchParams.has('redirect_uri')) {
    // OAuth (e.g. E-Signet) requires the redirect_uri in the auth and token calls to match exactly.
    // We remove search params and fragments (e.g. ?from=review, #field)
    // because they are navigation-specific and can cause redirect URI mismatches,
    // especially with real E-Signet which validates strictly.
    // (see issue https://github.com/opencrvs/opencrvs-core/issues/11603).
    parsed.searchParams.set('redirect_uri', getCleanRedirectURI())
  }
  return parsed.toString()
}

function LinkButtonInput({
  id,
  disabled,
  configuration
}: {
  id: string
  configuration: LinkButtonField['configuration']
  disabled?: boolean
}) {
  const intl = useIntl()
  const url = setRedirectURI(configuration.url)
  const isOnline = useOnlineStatus()
  const isDisabled = disabled || !isOnline

  return (
    <Button
      fullWidth
      disabled={isDisabled}
      element="a"
      href={url}
      id={id}
      size="large"
      type="primary"
    >
      {configuration.icon && (
        <Icon
          color="currentColor"
          name={throwIfUnsupportedIcon(configuration.icon)}
          size="large"
        />
      )}
      {intl.formatMessage(configuration.text)}
    </Button>
  )
}

export const LinkButton = {
  Input: LinkButtonInput,
  Output: null
}
