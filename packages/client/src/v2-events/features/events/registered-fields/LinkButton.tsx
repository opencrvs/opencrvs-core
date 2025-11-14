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

import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { LinkButtonField, TranslationConfig } from '@opencrvs/commons/client'
import { Button, Icon } from '@opencrvs/components'
import { useDrafts } from '../../drafts/useDrafts'
import { throwIfUnsupportedIcon } from './Button'

function setRedirectURI(url: string) {
  const parsed = new URL(url)
  if (!parsed.searchParams.has('redirect_uri')) {
    parsed.searchParams.set('redirect_uri', window.location.href)
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
  const { submitLocalDraft, isLocalDraftSubmitted } = useDrafts()

  useEffect(() => {
    if (isLocalDraftSubmitted) {
      window.location.href = url
    }
  }, [isLocalDraftSubmitted, url])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      submitLocalDraft()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error submitting local draft:', err)
    }
  }
  return (
    <Button
      fullWidth
      disabled={disabled}
      element="a"
      href={url}
      id={id}
      size="large"
      type="secondary"
      onClick={handleClick}
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
