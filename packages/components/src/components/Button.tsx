import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export const Button = styled.button.attrs<{ secondary?: boolean }>({})`
  width: auto;
  min-height: 44px;
  color: ${({ secondary, theme }) =>
    secondary ? theme.colors.accent : '#FFFFFF'};
  background: ${({ secondary, theme }) =>
    secondary ? '#FFFFFF' : theme.colors.primary};
  border: ${({ secondary, theme }) =>
    secondary ? `1px solid ${theme.colors.accent}` : '#FFFFFF'};
  border-radius: 2px;
  ${({ theme }) => theme.fonts.capsFontStyle} cursor: pointer;
  padding: 4px 35px 0px 35px;
  &:hover {
    background: linear-gradient(
      ${({ theme }) => theme.colors.hoverGradientDark},
      ${({ theme }) => theme.colors.primary}
    );
    color: ${({ secondary }) => (secondary ? '#FFFFFF' : '#FFFFFF')};
    border: ${({ secondary }) => (secondary ? '#FFFFFF' : '#FFFFFF')};
  }

  &:active {
    color: ${({ theme }) => theme.colors.accentGradientDark};
    outline: none;
  }

  &:disabled {
    background-color: '#FFFFFF';
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
