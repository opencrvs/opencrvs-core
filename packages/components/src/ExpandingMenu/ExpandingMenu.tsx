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
// Direct light-theme token access; dark-mode theme switching lands in a follow-up PR (#12628).
import { lightColors } from '../semantics'

const NavigationMainWrapper = styled.div`
  width: 100%;
  ${({ theme }) => theme.fonts.reg16};
  color: ${lightColors['text/primary']};
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
  background: ${lightColors['overlay/scrim']};
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
  background: ${lightColors['surface/inset']};
  width: 320px;
  height: 100vh;
  animation: 300ms ease-out 0s 1 slideInFromLeft;
`

interface IProps {
  showMenu: boolean
  menuCollapse: () => void
  navigation?: () => React.ReactNode
}

export const ExpandingMenu = ({
  showMenu,
  menuCollapse,
  navigation
}: IProps) => {
  if (!showMenu) {
    return null
  }

  return (
    <NavigationMainWrapper
      data-testid="expanding-menu"
      onClick={() => menuCollapse()}
    >
      <Backdrop />
      <NavigationContainer onClick={(e) => e.stopPropagation()}>
        {navigation && navigation()}
      </NavigationContainer>
    </NavigationMainWrapper>
  )
}
