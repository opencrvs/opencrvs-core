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
import { BackArrowDeepBlue, Cross } from '../icons'
import { CircleButton } from '../buttons'
const ActionContainer = styled.div`
  width: 100%;
`
const HeaderContainer = styled.div`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
`
const BodyContent = styled.div`
  width: 100%;
  height: 64px;
  padding: 24px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
`
const BackButtonContainer = styled.div`
  margin-right: 16px;
  cursor: pointer;
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  text-transform: capitalize;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`
const MenuTitle = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`

const Container = styled.div<{ hideBackground: boolean | undefined }>`
  ${({ theme }) => theme.fonts.bodyStyle};
  ${({ theme, hideBackground }) =>
    hideBackground ? '' : theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  padding: 24px 32px 32px;
  margin: 32px auto 0;
  max-width: 940px;
  background: ${({ theme, hideBackground }) =>
    hideBackground ? '' : theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 40px 54px;
    padding: 24px 32px;
    min-height: 100vh;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin: 0;
    padding: 24px 32px;
    min-height: 100vh;
  }
`
interface IProps {
  title?: string
  hideBackground?: boolean
  backLabel?: string
  icon?: () => React.ReactNode
  id?: string
  goHome?: () => void
}

export class ActionPageLight extends React.Component<
  IProps & {
    goBack: () => void
  }
> {
  render() {
    const { id, title, icon, goBack, goHome, backLabel, hideBackground } =
      this.props

    return (
      <ActionContainer id={id}>
        <HeaderContainer>
          <BodyContent>
            <BackButtonContainer id="action_page_back_button" onClick={goBack}>
              <CircleButton>
                {(icon && icon()) || <BackArrowDeepBlue />}
              </CircleButton>
              <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
            </BackButtonContainer>
            {title && <MenuTitle>{title}</MenuTitle>}
          </BodyContent>
          {goHome && (
            <CircleButton id="crcl-btn" onClick={goHome}>
              <Cross color="currentColor" />
            </CircleButton>
          )}
        </HeaderContainer>
        <Container hideBackground={hideBackground}>
          {this.props.children}
        </Container>
      </ActionContainer>
    )
  }
}
