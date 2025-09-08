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
import { TranslationConfig } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'

function LinkButtonInput(coinfiguration: {
  url: string
  text: TranslationConfig
}) {
  const intl = useIntl()
  const handleClick = () => {
    window.location.href = coinfiguration.url
  }
  return (
    <Button type="secondary" onClick={handleClick}>
      {intl.formatMessage(coinfiguration.text)}
    </Button>
  )
}

export const LinkButton = {
  Input: LinkButtonInput,
  Output: null
}
