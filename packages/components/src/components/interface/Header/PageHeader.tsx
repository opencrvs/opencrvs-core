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
import { grid } from '../../grid'
import styled from 'styled-components'

const PageHeaderWrapper = styled.div`
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const Left = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 0;
  flex: 1;
`
const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const Title = styled.div`
  ${({ theme }) => theme.fonts.h4};
  color: ${({ theme }) => theme.colors.grey800};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 100px; */
  height: 27px;
  /* left: 71px; */
  /* top: 14px; */
`

export interface IPageHeaderProps {
  id?: string
  mobileLeft?: React.ReactElement[]
  mobileTitle?: string
  mobileRight?: React.ReactElement[]
  desktopLeft?: React.ReactElement[]
  desktopTitle?: string
  desktopRight?: React.ReactElement[]
}

export type IFullProps = IPageHeaderProps & React.HTMLAttributes<HTMLDivElement>

interface IState {
  width: number
}
export class PageHeader extends React.Component<IFullProps, IState> {
  state = {
    width: window.innerWidth
  }

  componentDidMount() {
    window.addEventListener('resize', this.recordWindowWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recordWindowWidth)
  }

  recordWindowWidth = () => {
    this.setState({ width: window.innerWidth })
  }
  render() {
    const props: IPageHeaderProps = this.props as IPageHeaderProps
    const headerProps: React.HTMLAttributes<HTMLDivElement> = this
      .props as React.HTMLAttributes<HTMLDivElement>

    if (this.state.width > grid.breakpoints.lg) {
      return (
        <PageHeaderWrapper id={props.id} {...headerProps}>
          <Left>
            {props.desktopLeft && (
              <Actions>{props.desktopLeft.map((el) => el)}</Actions>
            )}
            {props.desktopTitle && <Title>{props.desktopTitle}</Title>}
          </Left>
          {props.desktopRight && (
            <Actions>{props.desktopRight?.map((el) => el)}</Actions>
          )}
        </PageHeaderWrapper>
      )
    } else {
      return (
        <PageHeaderWrapper id={props.id} {...headerProps}>
          <Left>
            {props.mobileLeft && (
              <Actions>{props.mobileLeft.map((el) => el)}</Actions>
            )}
            {props.mobileTitle && <Title>{props.mobileTitle}</Title>}
          </Left>
          {props.mobileRight && (
            <Actions>{props.mobileRight?.map((el) => el)}</Actions>
          )}
        </PageHeaderWrapper>
      )
    }
  }
}
