import styled from 'styled-components'
import { Button } from './Button'

export const IconButton = styled(Button)`
  position: relative;
  width: 42px;
  height: 42px;
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
    outline: none;
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.focus};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.placeholder};
  }
  & > svg {
    padding: 5px;
  }
`
