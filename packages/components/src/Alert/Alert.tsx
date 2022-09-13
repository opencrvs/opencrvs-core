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
import React from 'react'
import styled from 'styled-components'
import { Check, Help, Cross, NotificationError, Notification } from '../icons'
import { CircleButton, TertiaryButton } from '../buttons'
import { Spinner } from '../Spinner'
import { Text } from '../Text'
import { colors } from '../colors'

export type AlertType = 'success' | 'neutral' | 'loading' | 'info' | 'warning'

const Container = styled.div<{
  $type?: AlertType
}>`
  --color: ${({ $type, theme }) => `
    ${$type === 'success' ? theme.colors.positiveDark : ''}
    ${$type === 'loading' ? theme.colors.primaryDark : ''}
    ${$type === 'info' ? theme.colors.primaryDark : ''}
    ${$type === 'warning' ? theme.colors.negativeDark : ''}
    ${$type === 'neutral' ? theme.colors.orangeDark : ''}
    ${$type === undefined ? theme.colors.positiveDark : ''}
  `};

  min-height: 52px;
  display: flex;
  filter: drop-shadow(0px 2px 4px rgba(34, 34, 34, 0.24));
  border-radius: 4px;
  border: 2px solid var(--color);
  border-left-width: 0px;
  background: linear-gradient(
    to right,
    var(--color) 48px,
    ${({ theme }) => theme.colors.white} 48px
  );
`

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
  width: 48px;
  color: ${({ theme }) => theme.colors.white};
`

const Close = styled(CircleButton)`
  color: var(--color) !important;
  margin-top: 4px;
  margin-right: 4px;
`

const ActionButton = styled(TertiaryButton)`
  margin-top: 8px;
`

const ButtonText = styled(Text)`
  color: var(--color) !important;
  padding: 0 4px;
`

const NotificationMessage = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: var(--color);
  position: relative;
  padding: 13px 16px;
  min-width: 160px;
  max-width: calc(100% - 48px);
  flex: 1;
`

export interface IAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: AlertType
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
}

/**
 * Alert informs about persistent conditions or important information. See `<Toast>` for informing users about feedback of their actions.
 */
export const Alert = ({
  type,
  onClose,
  onActionClick,
  actionText,
  children,
  ...props
}: IAlertProps) => (
  <Container $type={type} {...props}>
    <IconContainer>
      {type === 'success' && <Check />}
      {type === 'neutral' && <Help />}
      {type === 'warning' && <NotificationError />}
      {type === 'info' && <Notification />}
      {type === 'loading' && (
        <Spinner
          id="in-progress-floating-notification"
          baseColor={colors.white}
          size={22}
        />
      )}
    </IconContainer>

    <NotificationMessage>{children}</NotificationMessage>

    {onActionClick && (
      <ActionButton onClick={onActionClick}>
        <ButtonText variant="bold14" element="span">
          {actionText}
        </ButtonText>
      </ActionButton>
    )}

    {onClose && (
      <Close id={props.id + 'Cancel'} onClick={onClose}>
        <Cross color="currentColor" />
      </Close>
    )}
  </Container>
)
