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
import {
  CheckCircle,
  CircleNotch,
  Info,
  Warning,
  WarningCircle
} from '../Icon/all-icons'
import { Button } from '../Button'
import { Text } from '../Text'
import { Icon } from '../Icon'

export type AlertType = 'success' | 'warning' | 'loading' | 'info' | 'error'

/**
 * Each type carries a border and an icon in its feedback colour, over the
 * palest tint of the same hue.
 */
const TONES = {
  success: { line: 'positive', tint: 'greenLighter', Glyph: CheckCircle },
  warning: { line: 'orange', tint: 'orangeLighter', Glyph: Warning },
  error: { line: 'negative', tint: 'redLighter', Glyph: WarningCircle },
  info: { line: 'teal', tint: 'tealLighter', Glyph: Info },
  loading: { line: 'teal', tint: 'tealLighter', Glyph: CircleNotch }
} as const

const Container = styled.div<{ $type: AlertType }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme, $type }) => theme.colors[TONES[$type].line]};
  background: ${({ theme, $type }) => theme.colors[TONES[$type].tint]};
`

const IconContainer = styled.div<{ $type: AlertType }>`
  flex: 0 0 auto;
  display: flex;
  color: ${({ theme, $type }) => theme.colors[TONES[$type].line]};
`

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Title = styled.div<{ $type: AlertType }>`
  ${({ theme }) => theme.fonts.bold14};
  line-height: 130%;
  color: ${({ theme, $type }) =>
    $type === 'loading'
      ? theme.colors.primary
      : theme.colors[TONES[$type].line]};
`

const Message = styled.div`
  ${({ theme }) => theme.fonts.reg14};
  line-height: 150%;
  color: ${({ theme }) => theme.colors.copy};
`

/**
 * The action sits under the message rather than beside it, so a long message
 * keeps the full width and a long label is not squeezed into a column.
 */
const Actions = styled.div`
  display: flex;
  margin-top: 4px;
  margin-left: -8px;
`

const Close = styled(Button)`
  flex: 0 0 auto;
  margin: -8px -8px 0 0;
`

export interface IAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: AlertType
  /** A short statement of the situation, in the type's colour. */
  title?: string
  onClose?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  onActionClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
  actionText?: string
  customIcon?: React.ReactNode
  'data-testid'?: string
}

/**
 * Alert informs about persistent conditions or important information. See `<Toast>` for informing users about feedback of their actions.
 */
export const Alert = ({
  type,
  title,
  onClose,
  onActionClick,
  actionText,
  children,
  customIcon,
  ...props
}: IAlertProps) => {
  const { Glyph } = TONES[type]

  return (
    <Container $type={type} {...props}>
      <IconContainer $type={type}>
        {customIcon ?? <Glyph size={24} />}
      </IconContainer>

      <Content>
        {title && <Title $type={type}>{title}</Title>}
        {children && <Message>{children}</Message>}
        {onActionClick && (
          <Actions>
            <Button
              data-testid={
                props['data-testid'] && `${props['data-testid']}-action`
              }
              size="small"
              type="tertiary"
              onClick={onActionClick}
            >
              <Text element="span" variant="bold14">
                {actionText}
              </Text>
            </Button>
          </Actions>
        )}
      </Content>

      {onClose && type !== 'loading' && (
        <Close
          data-testid={props['data-testid'] && `${props['data-testid']}-close`}
          id={props.id + 'Cancel'}
          type="icon"
          onClick={onClose}
        >
          <Icon color="currentColor" name="X" size="small" />
        </Close>
      )}
    </Container>
  )
}
