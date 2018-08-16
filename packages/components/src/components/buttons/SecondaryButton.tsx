import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from './Button'

export const SecondaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.accent};
  background: #ffffff;
  border: ${({ theme }) => `1px solid ${theme.colors.accent}`};
  border-radius: 2px;
  ${({ theme }) => theme.fonts.capsFontStyle};

  &:hover {
    background: linear-gradient(
      ${({ theme }) => theme.colors.hoverGradientDark},
      ${({ theme }) => theme.colors.primary}
    );
    color: #ffffff;
    border: #ffffff;
  }

  &:active {
    color: ${({ theme }) => theme.colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: #ffffff;
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
