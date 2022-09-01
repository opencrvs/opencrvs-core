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
import { grid } from '../grid'
import { Text } from '../Text'
import { useWindowSize } from './useWindowSize'

const AppBarWrapper = styled.div`
  padding: 0 16px;
  height: 56px;
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
  flex: 1;
  gap: 16px;
`
const Actions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const Title = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 25px;
`

interface IProps {
  mobileLeft?: React.ReactNode
  mobileTitle?: React.ReactNode
  mobileRight?: React.ReactNode
  desktopLeft?: React.ReactNode
  desktopTitle?: React.ReactNode
  desktopRight?: React.ReactNode
}

export type IAppBarProps = IProps & React.HTMLAttributes<HTMLSpanElement>

/**
 * `AppBar` is a header component used by `AppBar`. It always either renders either mobile or desktop props.
 * The component gives flexibility on what is shown on either mobile or desktop.
 */
export const AppBar = (props: IAppBarProps) => {
  const { width } = useWindowSize()

  if (width > grid.breakpoints.lg) {
    return (
      <AppBarWrapper id={props.id} className={props.className}>
        <Left>
          {props.desktopLeft && <Actions>{props.desktopLeft}</Actions>}
          {props.desktopTitle && (
            <Title variant="h4" element="h1">
              {props.desktopTitle}
            </Title>
          )}
        </Left>

        {props.desktopRight && <Actions>{props.desktopRight}</Actions>}
      </AppBarWrapper>
    )
  } else {
    return (
      <AppBarWrapper id={props.id} className={props.className}>
        <Left>
          {props.mobileLeft && <Actions>{props.mobileLeft}</Actions>}
          {props.mobileTitle && (
            <Title variant="h4" element="h1">
              {props.mobileTitle}
            </Title>
          )}
        </Left>

        {props.mobileRight && <Actions>{props.mobileRight}</Actions>}
      </AppBarWrapper>
    )
  }
}
