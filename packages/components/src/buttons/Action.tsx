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
import * as React from 'react'
import styled from 'styled-components'

import { Button, IButtonProps } from './Button'
import { ArrowWithGradient, DisabledArrow } from '../icons'

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
  ${({ theme }) => theme.fonts.h2};
  margin: 0;
`

const ActionDescription = styled.p<{ disabled?: boolean }>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.colors.disabled : theme.colors.secondary};
  ${({ theme }) => theme.fonts.reg16};
  margin: 0;
  margin-top: 3px;
  strong {
    ${({ theme }) => theme.fonts.bold16};
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
