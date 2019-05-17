import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from './Button'

export const PrimaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
  justify-content: center;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.buttonStyle};

  &:hover {
    background: linear-gradient(
      ${({ theme }) => theme.colors.hoverGradientDark},
      ${({ theme }) => theme.colors.primary}
    );
    color: ${({ theme }) => theme.colors.white};
  }
  &:focus {
    outline: none;
  }

  &:active {
    background: ${({ theme }) => theme.colors.primary};
    padding: 0 32px;
    border: 3px solid ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledButton};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
