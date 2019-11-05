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
import styled from 'styled-components'
import { Button, IButtonProps } from './Button'
import { PlusTransparent, MinusTransparent } from '../icons'

export const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  padding: 0 8px;
  flex-shrink: 1;
  background: ${({ theme }) => theme.colors.white};
  margin-bottom: 1px;
  &:last-child {
    margin-bottom: 0;
  }
  justify-content: center;
  align-items: center;
  & > div {
    top: 0;
  }
  border: none;
  outline: none;
`
export interface IExpansionButtonProps extends IButtonProps {
  expanded?: boolean
}

export function ExpansionButton(props: IExpansionButtonProps) {
  return (
    <StyledButton
      icon={() => {
        return props.expanded ? <MinusTransparent /> : <PlusTransparent />
      }}
      {...props}
    />
  )
}
