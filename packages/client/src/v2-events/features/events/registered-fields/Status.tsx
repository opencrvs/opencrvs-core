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
import { useIntl } from 'react-intl'
import { Icon, Pill } from '@opencrvs/components'
import { FieldProps } from '@opencrvs/commons/client'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'

function throwIfUnsupportedIcon(icon: string) {
  if (icon in SupportedIcons) {
    return icon as keyof typeof SupportedIcons
  }

  throw new Error(
    `Unsupported icon in FieldType.STATUS: ${icon}. Please use one of the supported icons from @opencrvs/components`
  )
}

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`

function StatusOutput({
  id,
  configuration
}: Pick<FieldProps<'STATUS'>, 'id' | 'configuration'>) {
  const intl = useIntl()

  return (
    <Pill
      data-testid={`${id}__${configuration.theme}`}
      label={
        <>
          <StyledIcon
            name={throwIfUnsupportedIcon(configuration.icon)}
            size="small"
          />
          {intl.formatMessage(configuration.text)}
        </>
      }
      pillTheme="dark"
      size="small"
      type={configuration.theme}
    />
  )
}

export const Status = {
  Input: StatusOutput,
  Output: StatusOutput
}
