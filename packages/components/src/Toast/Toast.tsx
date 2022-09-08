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
import styled, { keyframes, withTheme, css } from 'styled-components'
import { Success, HelpWhite, Cross } from '../icons'
import { Spinner } from '../Spinner'
import { ITheme } from '../theme'
import NotificationError from '../icons/NotificationError'
import { CircleButton, Button } from '../buttons'
import { Text } from '../Text'

const NOTIFICATION_AUTO_HIDE_TIMEOUT = 20000 // 20 seconds

export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  NEUTRAL = 'neutral',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}

export interface IToastProps {
  id?: string
  show: boolean
  type?: NOTIFICATION_TYPE
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
  children: React.ReactNode
}

type FullProps = IToastProps & { theme: ITheme }

const easeInFromBottom = keyframes`
  from { bottom: -200px; }
  to { bottom: 100px; }
`

const easeInFromTop = keyframes`
  from { top: -200px; }
  to { top: 56px; }
`

const NotificationContainer = styled.div<{
  $type?: NOTIFICATION_TYPE
  $show: boolean
}>`
  --color: ${({ $type, theme }) => `
    ${$type === NOTIFICATION_TYPE.SUCCESS ? theme.colors.positiveDark : ''}
    ${$type === NOTIFICATION_TYPE.IN_PROGRESS ? theme.colors.primaryDark : ''}
    ${$type === NOTIFICATION_TYPE.ERROR ? theme.colors.negativeDark : ''}
    ${$type === NOTIFICATION_TYPE.NEUTRAL ? theme.colors.neutralDark : ''}
    ${$type === undefined ? theme.colors.positiveDark : ''}
  `};

  position: fixed;
  width: 50%;
  max-width: 520px;
  min-height: 52px;
  transform: translateX(-50%);
  left: 50%;
  display: flex;
  filter: drop-shadow(0px 2px 4px rgba(34, 34, 34, 0.24));
  z-index: 1;
  align-items: center;
  border-radius: 4px;
  border: 2px solid var(--color);
  border-left-width: 0px;
  background: linear-gradient(
    to right,
    var(--color) 48px,
    ${({ theme }) => theme.colors.white} 48px
  );

  ${({ $show }) =>
    $show
      ? css`
          animation: ${easeInFromBottom} 500ms ease-in-out;
          bottom: 100px;
        `
      : `display: none;`}

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;

    ${({ $show }) =>
      $show &&
      css`
        animation: ${easeInFromTop} 500ms ease-in-out;
        top: 56px;
        bottom: auto;
      `}
  }
`

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 48px;
`

const Close = styled(CircleButton)`
  color: var(--color) !important;
`

const ButtonText = styled(Text)`
  color: var(--color) !important;
  padding: 0 4px;
`

const NotificationMessage = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: var(--color);
  position: relative;
  padding: 8px 16px;
  min-width: 160px;
  max-width: calc(100% - 48px);
  flex: 1;
`

class ToastComp extends React.Component<FullProps> {
  autoHideTimeout = setTimeout(
    this.closeNotification,
    NOTIFICATION_AUTO_HIDE_TIMEOUT
  )

  componentWillUnmount() {
    clearTimeout(this.autoHideTimeout)
  }

  // Issue 3203: The notification will be disappeared automatically
  closeNotification() {
    if (this.props && this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    const {
      id,
      type,
      show,
      children,
      onClose,
      className,
      theme,
      onActionClick,
      actionText
    } = this.props
    return (
      <NotificationContainer
        id={id}
        $type={type}
        $show={show}
        className={className}
        role="alert"
      >
        <IconContainer>
          {type === NOTIFICATION_TYPE.SUCCESS && <Success />}
          {type === NOTIFICATION_TYPE.NEUTRAL && <HelpWhite />}
          {type === NOTIFICATION_TYPE.ERROR && <NotificationError />}
          {type === NOTIFICATION_TYPE.IN_PROGRESS && (
            <Spinner
              id="in-progress-floating-notification"
              baseColor={theme.colors.white}
              size={24}
            />
          )}
        </IconContainer>

        <NotificationMessage>{children}</NotificationMessage>

        {onActionClick && (
          <Button onClick={onActionClick}>
            <ButtonText variant="bold14" element="span">
              {actionText}
            </ButtonText>
          </Button>
        )}

        {onClose && (
          <Close id={id + 'Cancel'} onClick={onClose}>
            <Cross color="currentColor" />
          </Close>
        )}
      </NotificationContainer>
    )
  }
}

export const Toast = withTheme(ToastComp)
