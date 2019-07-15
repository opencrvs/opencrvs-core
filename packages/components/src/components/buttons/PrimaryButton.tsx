import styled from 'styled-components'
import { Button } from './Button'

export const PrimaryButton = styled(Button)`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.primary};
  ${({ theme }) => theme.shadows.mistyShadow};
  justify-content: center;
  border-radius: 2px;
  ${({ theme }) => theme.fonts.buttonStyle};

  &:hover:enabled {
    ${({ theme }) => theme.gradients.gradientSkyDark};
    color: ${({ theme }) => theme.colors.white};
  }
  &:focus {
    outline: none;
  }

  &:active:enabled {
    background: ${({ theme }) => theme.colors.primary};
    outline: 3px solid ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.placeholder};
  }
`
