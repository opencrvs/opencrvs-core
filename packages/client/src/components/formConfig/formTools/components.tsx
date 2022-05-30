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
import styled from '@client/styledComponents'
import { useDispatch } from 'react-redux'
import { modifyConfigField } from '@client/forms/configuration/formConfig/actions'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { IConfigField } from '@client/forms/configuration/formConfig/utils'
import { Tooltip } from '@opencrvs/components/lib/icons'

export const Title = styled.h3`
  margin: 0;
  ${({ theme }) => theme.fonts.h3}
`

export const Label = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  color: ${({ theme }) => theme.colors.grey600};
  display: flex;
  align-items: center;
  gap: 4px;
`

export const CenteredToggle = styled(Toggle)`
  align-self: center;
`

export const StyledTooltip = styled(Tooltip)`
  height: 16px;
  width: 16px;
`

export function RequiredToggleAction({ fieldId, required }: IConfigField) {
  const dispatch = useDispatch()

  return (
    <CenteredToggle
      defaultChecked={!!required}
      onChange={() =>
        dispatch(
          modifyConfigField(fieldId, {
            required: !required
          })
        )
      }
    />
  )
}
