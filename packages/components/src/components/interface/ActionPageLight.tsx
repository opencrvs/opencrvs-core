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
import { IPageHeaderProps, PageHeader } from './Header/PageHeader'
const ActionContainer = styled.div`
  width: 100%;
`
const BackButtonContainer = styled.div`
  margin-right: 16px;
  cursor: pointer;
`

const BackButtonText = styled.span`
  ${({ theme }) => theme.fonts.bold16};
  text-transform: capitalize;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

const Container = styled.div<{ hideBackground: boolean | undefined }>`
  ${({ theme }) => theme.fonts.reg16};
  ${({ theme, hideBackground }) => (hideBackground ? '' : theme.shadows.light)};
  color: ${({ theme }) => theme.colors.copy};
  padding: 24px 32px 32px;
  margin: 0 auto;
  max-width: 940px;
  background: ${({ theme, hideBackground }) =>
    hideBackground ? '' : theme.colors.white};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    padding: 24px 32px;
    min-height: 100vh;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
    margin: 0;
    padding: 0;
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
  getHeaderLeft = () => {
    const { icon, goBack, backLabel } = this.props
    return [
      <BackButtonContainer
        id="action_page_back_button"
        onClick={goBack}
        key="action_page_back_button"
      >
        <CircleButton>{(icon && icon()) || <BackArrowDeepBlue />}</CircleButton>
        <BackButtonText>{backLabel ? backLabel : ''}</BackButtonText>
      </BackButtonContainer>
    ]
  }
  getHeaderRight = () => {
    const { goHome } = this.props
    return [
      (goHome && (
        <CircleButton id="crcl-btn" onClick={goHome} key="crcl-btn">
          <Cross color="currentColor" />
        </CircleButton>
      )) || <></>
    ]
  }

  render() {
    const { id, title, hideBackground } = this.props

    const pageHeaderProps: IPageHeaderProps = {
      id: 'pageHeader',
      mobileTitle: title,
      mobileLeft: this.getHeaderLeft(),
      mobileRight: this.getHeaderRight(),
      desktopTitle: title,
      desktopLeft: this.getHeaderLeft(),
      desktopRight: this.getHeaderRight()
    }

    return (
      <ActionContainer id={id}>
        <PageHeader {...pageHeaderProps} />
        <Container hideBackground={hideBackground}>
          {this.props.children}
        </Container>
      </ActionContainer>
    )
  }
}
