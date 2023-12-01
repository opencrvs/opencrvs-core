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

const NavigationMainWrapper = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.copy};
  height: 100vh;
  z-index: 99999;
  position: fixed;
  top: 0px;
  left: 0px;
`

const Backdrop = styled.div`
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.8;
    }
  }
  background: ${({ theme }) => theme.colors.grey600};
  opacity: 0.8;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
  animation: 300ms ease-out 0s 1 fadeIn;
`
const NavigationContainer = styled.div`
  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.grey100};
  width: 320px;
  height: 100vh;
  animation: 300ms ease-out 0s 1 slideInFromLeft;
`

interface IProps {
  showMenu: boolean
  menuCollapse: () => void
  navigation?: () => React.ReactNode
}

export class ExpandingMenu extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      showMenu: this.props.showMenu
    }
  }
  render() {
    return (
      this.props.showMenu && (
        <NavigationMainWrapper onClick={() => this.props.menuCollapse()}>
          <Backdrop />
          <NavigationContainer onClick={(e) => e.stopPropagation()}>
            {this.props.navigation && this.props.navigation()}
          </NavigationContainer>
        </NavigationMainWrapper>
      )
    )
  }
}
