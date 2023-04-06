import React from 'react'
import styled from 'styled-components'

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`

const TooltipContent = styled.div<{ position: React.ReactNode }>`
  visibility: hidden;
  background-color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold12};
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  border-radius: 8px;
  padding: 6px 12px;
  position: absolute;
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;

  ${({ position }) => {
    switch (position) {
      case 'top':
        return `
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -4px;
            border-width: 4px;
            border-style: solid;
            border-color: #222 transparent transparent transparent;
          }
        `
      case 'bottom':
        return `
          top: 125%;
          left: 50%;
          transform: translateX(-50%);
          &::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -4px;
            border-width: 4px;
            border-style: solid;
            border-color: transparent transparent #222 transparent;
          }
        `
      case 'bottomLeft':
        return `
            top: 125%;
            left: 50%;
            transform: translateX(-80%);
            &::after {
              content: '';
              position: absolute;
              bottom: 100%;
              left: 80%;
              margin-left: -4px;
              border-width: 4px;
              border-style: solid;
              border-color: transparent transparent #222 transparent;
            }
          `
      case 'left':
        return `
          top: 50%;
          right: 115%;
          transform: translateY(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -4px;
            border-width: 4px;
            border-style: solid;
            border-color: transparent transparent transparent #222;
          }
        `
      case 'bottomRight':
        return `
              top: 125%;
              left: 50%;
              transform: translateX(-20%);
              &::after {
                content: '';
                position: absolute;
                bottom: 100%;
                right: 80%;
                margin-right: -4px;
                border-width: 4px;
                border-style: solid;
                border-color: transparent transparent #222 transparent;
              }
            `
      case 'right':
        return `
          top: 50%;
          left: 115%;
          transform: translateY(-50%);
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -4px;
            border-width: 4px;
            border-style: solid;
            border-color: transparent #222 transparent transparent;
          }
        `
      default:
        return ''
    }
  }}
`

const TooltipTrigger = styled.span`
  &:hover + ${TooltipContent} {
    visibility: visible;
    opacity: 1;
  }
`

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  return (
    <TooltipWrapper>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent position={position}>{content}</TooltipContent>
    </TooltipWrapper>
  )
}
