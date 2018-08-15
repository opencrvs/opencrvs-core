import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from '../buttons'

export const Tabs = styled.div`
  position: relative;
  white-space: nowrap;
`

export const Tab = styled(Button).attrs<{ active?: boolean }>({})`
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 18px;
  ${({ active }) => (active ? 'border-bottom: 3px solid #5E93ED' : '')};
`
