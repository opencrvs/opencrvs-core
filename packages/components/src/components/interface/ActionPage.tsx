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
import { ArrowBack } from '../icons'
import { PrimaryButton } from '../buttons'
const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
  height: 90px;
  display: block;
  justify-content: space-between;
  align-items: center;
  position: relative;
`
const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 20px 10px;
`
const BackButtonContainer = styled.div`
  float: left;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`
const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
`
const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: capitalize;
  margin-left: 14px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.span`
  ${({ theme }) => theme.fonts.h4Style};
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`
interface IProps {
  title?: string
  backLabel?: string
  icon?: () => React.ReactNode
}

export class ActionPage extends React.Component<
  IProps & {
    goBack: () => void
  }
> {
  render() {
    const { title, icon, goBack, backLabel } = this.props

    return (
      <ActionContainer>
        <HeaderContainer>
          <BodyContent>
            <BackButtonContainer id="action_page_back_button" onClick={goBack}>
              <BackButton icon={icon || (() => <ArrowBack />)} />
              <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
            </BackButtonContainer>
            {title && <MenuTitle>{title}</MenuTitle>}
          </BodyContent>
        </HeaderContainer>
        {this.props.children}
      </ActionContainer>
    )
  }
}
