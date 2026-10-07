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
import { CheckCircle, Info, Warning, WarningCircle } from '../Icon/all-icons'
import { Button } from '../Button'
import { Text } from '../Text'
import { Icon } from '../Icon'
import * as styles from './Alert.styles'

export type AlertType = 'success' | 'warning' | 'info' | 'error'

/** The glyph each type is recognised by. */
const GLYPHS = {
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  info: Info
} satisfies Record<AlertType, unknown>

const Container = styled.div<{ $type: AlertType }>`
  ${styles.base}

  ${(props) => props.$type === 'success' && styles.success}
  ${(props) => props.$type === 'warning' && styles.warning}
  ${(props) => props.$type === 'error' && styles.error}
  ${(props) => props.$type === 'info' && styles.info}
`

const IconContainer = styled.div`
  ${styles.iconArea}
`
const Content = styled.div`
  ${styles.content}
`
const Title = styled.div`
  ${styles.title}
`
const Message = styled.div`
  ${styles.message}
`
const Actions = styled.div`
  ${styles.actions}
`
const Close = styled(Button)`
  ${styles.close}
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
  const Glyph = GLYPHS[type]

  return (
    <Container $type={type} {...props}>
      <IconContainer>{customIcon ?? <Glyph size={24} />}</IconContainer>

      <Content>
        {title && <Title>{title}</Title>}
        {children && <Message>{children}</Message>}
        {onActionClick && actionText && (
          <Actions>
            <Button
              data-testid={
                props['data-testid'] && `${props['data-testid']}-action`
              }
              size="small"
              type="secondary"
              onClick={onActionClick}
            >
              <Text element="span" variant="bold14">
                {actionText}
              </Text>
            </Button>
          </Actions>
        )}
      </Content>

      {onClose && (
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
