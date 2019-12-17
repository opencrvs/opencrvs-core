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
import { Button } from '../../buttons'
import { Selector } from '../../icons'

export interface ICustomProps {
  selected?: boolean
}

export type IMenuItemContainerProps = ICustomProps &
  React.InputHTMLAttributes<HTMLInputElement>

const Item = styled(Button)<IMenuItemContainerProps>`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme, selected }) =>
    selected ? theme.colors.white : theme.colors.disabled};
`

const ItemContainer = styled.div`
  position: relative;
  height: 100%;
`

const ItemSelector = styled(Selector)`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
`

interface IProps {
  selected: boolean
  onClick?: () => void
  id?: string
}

export class MenuItem extends React.Component<IProps> {
  render() {
    return (
      <ItemContainer>
        <Item
          id={this.props.id}
          selected={this.props.selected}
          onClick={this.props.onClick}
        >
          {this.props.children}
        </Item>
        {this.props.selected ? <ItemSelector /> : <></>}
      </ItemContainer>
    )
  }
}
