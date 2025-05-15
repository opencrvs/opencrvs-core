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
import React, { useRef } from 'react'
import styled from 'styled-components'
import { Text } from '../Text'
import { Button } from '../Button'
import { Icon } from '../Icon'

export interface IDialogProps {
  id?: string
  titleIcon?: React.ReactNode
  title: string
  isOpen: boolean
  children?: React.ReactNode
  actions: JSX.Element[]
  onClose?: () => void
  variant?: 'small' | 'large'
}

const DialogWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.opacity54};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`

const DialogContainer = styled.div<{ variant?: 'small' | 'large' }>`
  position: relative;
  ${({ variant }) =>
    variant === 'small'
      ? `
        width: 480px;
        max-width: 90%;
      `
      : `
        height: 80vh;
        width: 80%;
            @media (max-width: 768px) and (orientation: portrait) {
             width: 100%;
             height: 100%;
             max-width: 100%;
             max-height: 100%;
             border-radius: 0;
             }
      `}
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.heavy};
  display: flex;
  flex-direction: column;
  max-height: 80vh;
`
const DialogHeader = styled.div`
  display: flex;
  padding: 10px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  justify-content: space-between;
`
const DialogTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const DialogContent = styled.div`
  padding: 24px 32px;
  flex-grow: 1;
  overflow-y: auto;
`

const DialogFooter = styled.div`
  padding: 24px 32px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.colors.grey200};
`

export function Dialog({
  id,
  title,
  onClose,
  isOpen,
  children,
  actions,
  variant = 'small',
  titleIcon
}: IDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const handleClose = () => {
    onClose && onClose()
  }

  const hasActions = actions && actions.length > 0

  const handleClickOutside = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (
      dialogRef.current &&
      !dialogRef.current.contains(event.target as Node)
    ) {
      handleClose()
    }
  }

  return (
    <>
      {isOpen && (
        <DialogWrapper onClick={handleClickOutside}>
          <DialogContainer id={id} variant={variant} ref={dialogRef}>
            <DialogHeader>
              <DialogTitle>
                {titleIcon}
                <Text variant="h2" element="h2" color="grey600">
                  {title}
                </Text>
              </DialogTitle>
              <Button type="icon" size="medium" onClick={handleClose}>
                <Icon name="X" size="large" weight="bold" />
              </Button>
            </DialogHeader>
            <DialogContent>{children}</DialogContent>
            {hasActions && <DialogFooter>{actions}</DialogFooter>}
          </DialogContainer>
        </DialogWrapper>
      )}
    </>
  )
}
