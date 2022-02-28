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
import { Hamburger } from '../../../icons/Hamburger'
import styled from 'styled-components'
import { CircleButton } from '../../../buttons'

interface IMenuAction {
  icon: () => React.ReactNode
  handler: () => void
}
export interface IMobileHeaderProps {
  id?: string
  mobileLeft?: IMenuAction
  title: string
  mobileBody?: JSX.Element
  mobileRight?: IMenuAction
}

const HeaderContainer = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  position: sticky;
  top: 0;
  justify-content: space-between;
  z-index: 2;
`

const Title = styled.span`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
  color: ${({ theme }) => theme.colors.grey800};
  align-self: center;
  position: absolute;
  width: 100px;
  height: 27px;
  left: 71px;
  top: 14px;
`

const HeaderBody = styled.div`
  margin: 0 16px;
  flex: 1;
  display: flex;
  height: 40px;

  form {
    width: 100%;
  }

  &:last-child {
    margin-right: 0;
  }
`

const SearchBody = styled.div`
  margin: 0 16px;
  flex: 1;
  display: flex;
  height: 40px;

  form {
    width: 100%;
  }

  &:last-child {
    margin-right: 0;
  }
`

const EndComponentContainer = styled.div`
  display: flex;
  flex: 0;

  button {
    padding: 0;
  }
`
class MobileHeader extends React.Component<IMobileHeaderProps> {
  render() {
    const { id, mobileLeft, mobileRight, title, mobileBody } = this.props
    return (
      <HeaderContainer id={id}>
        {mobileLeft && (
          <EndComponentContainer>
            <CircleButton
              id="mobile_header_left"
              onClick={mobileLeft.handler}
              color="#4972BB"
            >
              {!mobileBody && <Hamburger />}
              {mobileLeft.icon()}
            </CircleButton>
            <>{!mobileBody && mobileLeft.icon()}</>
          </EndComponentContainer>
        )}

        {mobileBody ? (
          <SearchBody>{mobileBody}</SearchBody>
        ) : (
          <HeaderBody>{<Title id="header_title">{title}</Title>}</HeaderBody>
        )}

        {mobileRight && (
          <EndComponentContainer>
            <CircleButton
              id="mobile_header_right"
              onClick={mobileRight.handler}
              color="#4972BB"
            >
              {mobileRight.icon()}
            </CircleButton>
          </EndComponentContainer>
        )}
      </HeaderContainer>
    )
  }
}

export { MobileHeader }
