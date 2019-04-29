import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'
import { Button, IButtonProps } from './Button'

export const PrimaryButton = styled(Button)`
  color: ${({ theme }: any) => theme.colors.white};
  background: ${({ theme }: any) => theme.colors.primary};
  border: ${({ theme }: any) => theme.colors.white};
  border-radius: 2px;
  ${({ theme }: any) => theme.fonts.capsFontStyle};

  &:hover {
    background: linear-gradient(
      ${({ theme }: any) => theme.colors.hoverGradientDark},
      ${({ theme }: any) => theme.colors.primary}
    );
    color: ${({ theme }: any) => theme.colors.white};
    border: ${({ theme }: any) => theme.colors.white};
  }

  &:active {
    color: ${({ theme }: any) => theme.colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: ${({ theme }: any) => theme.colors.white};
    cursor: not-allowed;
    color: ${({ theme }: any) => theme.colors.disabled};
  }
`
