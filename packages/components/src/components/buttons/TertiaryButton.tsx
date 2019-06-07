import styled from 'styled-components'
import { Button } from './Button'

export const TertiaryButton = styled(Button)`
  width: auto;
  ${({ theme }) => theme.fonts.buttonStyle};
  transition: background 0.4s ease;
  align-items: center;
  display: inline-flex;
  border: 0;

  text-transform: none !important;
  cursor: pointer;
  & div {
    padding: 0 8px;
  }
  color: ${({ theme }) => theme.colors.tertiary};
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }
  &:hover {
    opacity: 0.8;
    background: ${({ theme }) => theme.colors.background};
  }

  &:active {
    background: ${({ theme }) => theme.colors.focus};
  }
`
