import styled from 'styled-components'
import { Button } from './Button'

export const LinkButton = styled(Button)`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  padding: 0;
  height: auto;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration-line: underline;

  &:active {
    outline: 0;
    background-color: ${({ theme }) => theme.colors.creamCan};
  }

  &:disabled {
    cursor: not-allowed;
    color: ${({ theme }) => theme.colors.disabled};
  }
`
