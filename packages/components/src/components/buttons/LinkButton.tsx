import styled from 'styled-components'
import { Button } from './Button'

export const LinkButton = styled(Button)`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  padding: 0;
  height: auto;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration-line: underline;
  & div {
    padding: 0;
  }

  &:active {
    outline: 0;
    background-color: ${({ theme }) => theme.colors.creamCan};
  }

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    background-color: transparent;
  }
`
