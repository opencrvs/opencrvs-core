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
import React from 'react'
import styled from 'styled-components'
import { Check, Help, Cross, NotificationError, Notification } from '../icons'
import { Spinner } from '../Spinner'
import { Button } from '../Button'
import { Text } from '../Text'
import { colors } from '../colors'

export type AlertType = 'success' | 'warning' | 'loading' | 'info' | 'error'

const Container = styled.div<{
  $type?: AlertType
}>`
  --color: ${({ $type, theme }) => `
    ${$type === 'success' ? theme.colors.positiveDark : ''}
    ${$type === 'loading' ? theme.colors.primaryDark : ''}
    ${$type === 'info' ? theme.colors.tealDark : ''}
    ${$type === 'error' ? theme.colors.negativeDark : ''}
    ${$type === 'warning' ? theme.colors.orangeDark : ''}
    ${$type === undefined ? theme.colors.positiveDark : ''}
  `};

  display: flex;
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

const Close = styled(Button)`
  color: var(--color) !important;
  margin-top: 4px;
  margin-right: 4px;
`

const ActionButton = styled(Button)`
  margin-top: 8px;
  margin-right: 8px;
`

const ButtonText = styled(Text)`
  color: var(--color) !important;
  padding: 0 4px;
`

const NotificationMessage = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  color: var(--color);
  position: relative;
  padding: 12px 24px 12px 16px;
  min-width: 160px;
  max-width: calc(100% - 48px);
  flex: 1;
`

export interface IAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: AlertType
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
  customIcon?: React.ReactNode
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
  customIcon,
  ...props
}: IAlertProps) => (
  <Container $type={type} {...props}>
    <IconContainer>
      {!customIcon ? (
        <>
          {type === 'success' && <Check />}
          {type === 'warning' && <Help />}
          {type === 'error' && <NotificationError />}
          {type === 'info' && <Notification />}
          {type === 'loading' && (
            <Spinner
              id="in-progress-floating-notification"
              baseColor={colors.white}
              size={20}
            />
          )}
        </>
      ) : (
        <>{customIcon}</>
      )}
    </IconContainer>

    <NotificationMessage>{children}</NotificationMessage>

    {onActionClick && (
      <ActionButton
        type="tertiary"
        onClick={onActionClick}
        data-testid={props['data-testid'] && `${props['data-testid']}-action`}
      >
        <ButtonText variant="bold14" element="span">
          {actionText}
        </ButtonText>
      </ActionButton>
    )}

    {onClose && type !== 'loading' && (
      <Close
        type="icon"
        id={props.id + 'Cancel'}
        data-testid={props['data-testid'] && `${props['data-testid']}-close`}
        onClick={onClose}
      >
        <Cross color="currentColor" />
      </Close>
    )}
  </Container>
)
