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
import { grid } from '../grid'
import { Stack } from '../Stack'
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
  gap: 16px;
`

const Left = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 16px;
  grid-column: 1;
  overflow: hidden;
`

const Center = styled.div``

const Actions = styled.div<{ $flex?: '1' | 'none' }>`
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: right;
  flex: ${({ $flex }) => $flex ?? '1'};
`
const Title = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 25px;
`

type IProps = {
  mobileLeft?: React.ReactNode
  mobileTitle?: React.ReactNode
  mobileRight?: React.ReactNode
  desktopLeft?: React.ReactNode
  desktopTitle?: React.ReactNode
  desktopCenter?: React.ReactNode
  desktopRight?: React.ReactNode
}

export type IAppBarProps = IProps & React.HTMLAttributes<HTMLSpanElement>

/**
 * `AppBar` is a header component usually used by `Frame`. It always either renders either mobile or desktop props.
 * The component gives flexibility on what is shown on either mobile or desktop.
 *
 * **Note:** You can only use either `desktopTitle` or `desktopCenter` at the same time.
 */
export const AppBar = (props: IAppBarProps) => {
  const { width } = useWindowSize()

  if (width > grid.breakpoints.lg) {
    return (
      <AppBarWrapper id={props.id} className={props.className}>
        <Left>
          {props.desktopLeft && <Stack>{props.desktopLeft}</Stack>}
          {props.desktopTitle && (
            <Title variant="h4" element="h1">
              {props.desktopTitle}
            </Title>
          )}
        </Left>
        {!props.desktopTitle && <Center>{props.desktopCenter}</Center>}
        <Actions $flex={props.desktopCenter ? '1' : 'none'}>
          {props.desktopRight}
        </Actions>
      </AppBarWrapper>
    )
  } else {
    return (
      <AppBarWrapper id={props.id} className={props.className}>
        <Left>
          {props.mobileLeft && <Stack>{props.mobileLeft}</Stack>}
          {props.mobileTitle && (
            <Title variant="h4" element="h1">
              {props.mobileTitle}
            </Title>
          )}
        </Left>

        {props.mobileRight && (
          <Actions $flex="none">{props.mobileRight}</Actions>
        )}
      </AppBarWrapper>
    )
  }
}
