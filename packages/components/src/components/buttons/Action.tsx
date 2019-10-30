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
import * as React from 'react'
import styled, { StyledComponentBase } from 'styled-components'

import { ITheme } from '../theme'
import { Button, IButtonProps } from './Button'
import { ArrowWithGradient } from '../icons'
import { DisabledArrow } from '../icons'

const ActionContainer = styled(Button)`
  width: 100%;
  min-height: 120px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.white};
  & div {
    padding: 0;
  }
  text-align: left;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  button:focus {
    outline: 0;
  }
`

const ActionTitle = styled.h3<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  ${({ theme }) => theme.fonts.h4Style};
  margin: 0;
`

const ActionDescription = styled.p<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.secondary};
  ${({ theme }) => theme.fonts.bodyStyle};
  margin: 0;
  margin-top: 3px;
  strong {
    ${({ theme }) => theme.fonts.bodyBoldStyle};
  }
`

export interface IActionProps extends IButtonProps {
  title: string
  description?: string
  disabled?: boolean
}

export function Action({
  title,
  description,
  disabled,
  ...props
}: IActionProps) {
  return (
    <ActionContainer
      icon={() => (disabled ? <DisabledArrow /> : <ArrowWithGradient />)}
      {...props}
    >
      <div>
        <ActionTitle disabled={disabled}>{title}</ActionTitle>
        {description && (
          <ActionDescription
            disabled={disabled}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
    </ActionContainer>
  )
}

export const ActionList = styled.div`
  z-index: 1;
  position: relative;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
