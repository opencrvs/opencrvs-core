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
import { BackArrow } from '../icons'
import { CircleButton } from '../buttons'
import { Box } from './Box'

const SubPageContainer = styled.div`
  width: 100%;
  height: calc(100vh - 80px);
  ${({ theme }) => theme.fonts.reg16};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  display: flex;
  flex-direction: column;
  align-items: center;
`

const HeaderBlock = styled.div`
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  height: 64px;
  width: 100%;
  max-width: 940px;
  padding: 20px 10px;
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 1px;
  align-items: center;
`
const BackButton = styled((props) => <CircleButton {...props} />)`
  background: '#35495d00';
  margin-left: ${({ theme }) => theme.grid.margin}px;
`
const MenuTitle = styled.span`
  ${({ theme }) => theme.fonts.h4};
  margin-left: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const EmptyTitle = styled(MenuTitle)`
  color: ${({ theme }) => theme.colors.negative};
`
const BodyContainer = styled(Box)`
  width: 100%;
  max-width: 940px;
  flex-grow: 1;
`
interface IProps {
  title?: string
  emptyTitle: string
  goBack: () => void
}

export class SubPage extends React.Component<IProps> {
  render() {
    const { title, emptyTitle, goBack } = this.props

    return (
      <SubPageContainer>
        <HeaderBlock>
          <BackButton id="sub_page_back_button" onClick={goBack}>
            <BackArrow />
          </BackButton>
          {(title && <MenuTitle>{title}</MenuTitle>) || (
            <EmptyTitle>{emptyTitle}</EmptyTitle>
          )}
        </HeaderBlock>
        <BodyContainer>{this.props.children}</BodyContainer>
      </SubPageContainer>
    )
  }
}
