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
import styled, { keyframes, withTheme } from 'styled-components'
import { Cross, Alert, Success, Warning } from '../icons'
import { CircleButton } from '../buttons'
import { Spinner } from './Spinner'
import { ITheme } from '../theme'

export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}

interface IProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  callback?: (event: React.MouseEvent<HTMLDivElement>) => void
  className?: string
  children: React.ReactNode
}

type FullProps = IProps & { theme: ITheme }

const easeInFromBottom = keyframes`
  from { bottom: -200px; }
  to { bottom: 0px; }
`

const Wrapper = styled.div`
  position: fixed;
  padding: 8px 24px;
  width: 100%;
  display: flex;
  box-shadow: ${({ theme }) => theme.shadows.light};
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  &.show {
    animation: ${easeInFromBottom} 500ms;
    bottom: 0px;
  }

  &.hide {
    display: none;
  }

  &.success {
    background: ${({ theme }) => theme.colors.positive};
  }
  &.inProgress {
    background: ${({ theme }) => theme.colors.primary};
  }
  &.error {
    background: ${({ theme }) => theme.colors.negative};
  }
  &.warning {
    background: ${({ theme }) => theme.colors.neutral};
  }
`

const Content = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
`
const Close = styled.div`
  align-items: center;
  &.clickable {
    cursor: pointer;
  }
`

const ToastMessage = styled.div`
  position: relative;
  ${({ theme }) => theme.fonts.bold16};
  color: ${({ theme }) => theme.colors.white};
  min-width: 160px;
`

class ToastComp extends React.Component<FullProps> {
  render() {
    const { id, type, show, children, callback, className, theme } = this.props

    return (
      <Wrapper
        id={id}
        className={
          (type ? type : '') + (show ? ' show' : ' hide') + ' ' + className
        }
      >
        <Content>
          {type === NOTIFICATION_TYPE.SUCCESS && <Success />}
          {type === NOTIFICATION_TYPE.WARNING && <Warning />}
          {type === NOTIFICATION_TYPE.ERROR && <Alert />}
          {type === NOTIFICATION_TYPE.IN_PROGRESS && (
            <Spinner
              id="in-progress-floating-notification"
              baseColor={theme.colors.white}
              size={24}
            />
          )}
          <ToastMessage>{children}</ToastMessage>
        </Content>
        {callback && (
          <CircleButton
            id={`${id}Cancel`}
            onClick={callback}
            className={' clickable'}
            dark={true}
          >
            <Cross color="white" />
          </CircleButton>
        )}
      </Wrapper>
    )
  }
}

export const Toast = withTheme(ToastComp)
