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
import styled from 'styled-components'
import { TranslationConfig } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'

const StyledButton = styled(Button)`
  text-decoration: none;
`
function LinkButtonInput({
  id,
  disabled,
  configuration
}: {
  id: string
  configuration: {
    url: string
    text: TranslationConfig
  }
  disabled?: boolean
}) {
  const intl = useIntl()
  return (
    <StyledButton
      disabled={disabled}
      element="a"
      href={configuration.url}
      id={id}
      type="secondary"
    >
      {intl.formatMessage(configuration.text)}
    </StyledButton>
  )
}

export const LinkButton = {
  Input: LinkButtonInput,
  Output: null
}
