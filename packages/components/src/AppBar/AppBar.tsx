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
import { useWindowSize } from '../hooks'

const AppBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
`

const AppBarRowOne = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const AppBarRowTwo = styled.div`
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
`

const Center = styled.div`
  display: flex;
  justify-self: center;
  align-items: center;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
`

const MobileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const MobileLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  grid-column: 1;
  overflow: hidden;
  min-width: 0;
`

const MobileCenter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 16px;
  grid-column: 1;
`

const MobileRight = styled.div<{ $flex?: '1' | 'none' }>`
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  justify-self: right;
  flex: ${({ $flex }) => $flex ?? '1'};
`
const Title = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 25px;
  min-width: 0;
`

type IProps = {
  mobileLeft?: React.ReactNode
  mobileTitle?: React.ReactNode
  mobileCenter?: React.ReactNode
  mobileRight?: React.ReactNode
  appBarRowTwo?: React.ReactNode
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
        <AppBarRowOne>
          <Left>
            {props.desktopLeft && <Stack>{props.desktopLeft}</Stack>}
            {props.desktopTitle && (
              <Title variant="bold18" element="h1">
                {props.desktopTitle}
              </Title>
            )}
          </Left>
          <Center>{props.desktopCenter}</Center>
          <Right>{props.desktopRight}</Right>
        </AppBarRowOne>
      </AppBarWrapper>
    )
  }

  return (
    <AppBarWrapper id={props.id} className={props.className}>
      <MobileWrapper>
        <AppBarRowOne>
          <MobileLeft>
            {props.mobileLeft && <Stack>{props.mobileLeft}</Stack>}
            {props.mobileTitle && (
              <Title variant="bold18" element="h1">
                {props.mobileTitle}
              </Title>
            )}
          </MobileLeft>

          {!props.mobileTitle && (
            <MobileCenter>{props.mobileCenter}</MobileCenter>
          )}

          {props.mobileRight && (
            <MobileRight $flex="none">{props.mobileRight}</MobileRight>
          )}
        </AppBarRowOne>
        {props.appBarRowTwo && (
          <AppBarRowTwo>{props.appBarRowTwo}</AppBarRowTwo>
        )}
      </MobileWrapper>
    </AppBarWrapper>
  )
}
