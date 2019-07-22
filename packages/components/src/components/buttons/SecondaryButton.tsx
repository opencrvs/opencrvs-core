import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from './Button'

export const SecondaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.white};
  border: ${({ theme }) => `2px solid ${theme.colors.secondary}`};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  border-radius: 2px;
  ${({ theme }) => theme.fonts.buttonStyle};
  height: 40px;

  & div {
    padding-top: 2px;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    outline: 3px solid ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    border: ${({ theme }) => `2px solid ${theme.colors.disabled}`};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
