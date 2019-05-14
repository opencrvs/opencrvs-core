import styled from 'styled-components'
import { Button } from './Button'

export const TertiaryButton = styled(Button)`
  width: auto;
  font-family: ${({ theme }) => theme.fonts.boldFont};

  align-items: center;
  display: inline-flex;
  border: 0;
  cursor: pointer;
  & div {
    padding: 0 8px;
  }
  color: ${({ theme }) => theme.colors.primary};
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
  }
  &:hover {
    opacity: 0.8;
    background: ${({ theme }) => theme.colors.buttonHoverColor};
  }

  &:active {
    background: ${({ theme }) => theme.colors.creamCan};
  }
`
