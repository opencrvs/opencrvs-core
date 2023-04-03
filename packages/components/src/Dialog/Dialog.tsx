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
  const handleClose = () => {
    onClose && onClose()
  }

  const [hasOverflow, setHasOverflow] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const hasActions = actions && actions.length > 0

  useEffect(() => {
    if (contentRef.current) {
      const hasOverflow =
        contentRef.current.scrollHeight > contentRef.current.clientHeight
      setHasOverflow(hasOverflow)

      const handleScroll = () => {
        if (contentRef.current) {
          setHasScrolled(contentRef.current.scrollTop > 0)
        }
      }

      contentRef.current.addEventListener('scroll', handleScroll)

      return () => {
        contentRef.current?.removeEventListener('scroll', handleScroll)
      }
    }
    return undefined
  }, [contentRef, isOpen])

  const headerHasBorder = hasOverflow && hasScrolled

  return (
    <>
      {isOpen && (
        <DialogWrapper>
          <DialogContainer id={id} variant={variant}>
            <DialogHeader hasOverflow={headerHasBorder}>
              <Text variant="h2" element="h2" color="grey600">
                {title}
              </Text>
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
