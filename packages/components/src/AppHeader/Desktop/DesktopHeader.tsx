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
import { IDomProps } from '../AppHeader'

export interface IRightMenu {
  element: JSX.Element
}
export interface IDesktopHeaderProps {
  desktopRightMenu?: IRightMenu[]
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  height: 56px;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  flex-direction: row;
  justify-content: space-between;
  position: sticky;
  align-items: center;
  top: 0;
  z-index: 2;
  background: ${({ theme }) => theme.colors.white};
`
export class DesktopHeader extends React.Component<
  IDesktopHeaderProps & IDomProps
> {
  render() {
    const { id, className, desktopRightMenu } = this.props

    return (
      <HeaderContainer id={id} className={className}>
        {desktopRightMenu &&
          desktopRightMenu.map((item: IRightMenu, index) =>
            React.cloneElement(item.element, {
              key: index
            })
          )}
      </HeaderContainer>
    )
  }
}
