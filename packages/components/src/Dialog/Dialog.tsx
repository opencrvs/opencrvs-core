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
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Text } from '../Text'
import { Button } from '../Button'
import { Icon } from '../Icon'

export interface IDialogProps {
  id?: string
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
const DialogHeader = styled.div<{ hasOverflow?: boolean }>`
  display: flex;
  padding: 16px 16px 14px 24px;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  ${({ hasOverflow }) => hasOverflow && `border-bottom: 1px solid #ccc`}
`
const DialogTitle = styled.div`
  padding-top: 2px;
`

const DialogContent = styled.div`
  padding: 8px 24px 24px 24px;
  flex-grow: 1;
  overflow-y: auto;
`

const DialogFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
`

export function Dialog({
  id,
  title,
  onClose,
  isOpen,
  children,
  actions,
  variant = 'small'
}: IDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const handleClose = () => {
    onClose && onClose()
  }

  const [hasOverflow, setHasOverflow] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
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

  useEffect(() => {
    const contentReference = contentRef.current

    const hasOverflow =
      contentReference &&
      contentReference?.scrollHeight > contentReference?.clientHeight

    setHasOverflow(hasOverflow ?? false)

    const handleScroll = () => {
      if (contentReference) {
        setHasScrolled(contentReference.scrollTop > 0)
      }
    }

    contentReference?.addEventListener('scroll', handleScroll)

    return () => {
      contentReference?.removeEventListener('scroll', handleScroll)
    }
  }, [contentRef, isOpen])

  const headerHasBorder = hasOverflow && hasScrolled

  return (
    <>
      {isOpen && (
        <DialogWrapper onClick={handleClickOutside}>
          <DialogContainer id={id} variant={variant} ref={dialogRef}>
            <DialogHeader hasOverflow={headerHasBorder}>
              <DialogTitle>
                <Text variant="h2" element="h2" color="grey600">
                  {title}
                </Text>
              </DialogTitle>
              <Button type="icon" size="small" onClick={handleClose}>
                <Icon name="X" size="medium" weight="bold" />
              </Button>
            </DialogHeader>
            <DialogContent ref={contentRef}>{children}</DialogContent>
            {hasActions && <DialogFooter>{actions}</DialogFooter>}
          </DialogContainer>
        </DialogWrapper>
      )}
    </>
  )
}
