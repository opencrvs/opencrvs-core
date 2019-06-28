import styled from 'styled-components'
import { Button } from './Button'

export const LinkButton = styled(Button)`
  ${({ theme }) => theme.fonts.bodyStyle}
  color: ${({ theme }) => theme.colors.tertiary};
  padding: 0;
  height: auto;
  text-decoration-line: underline;
  & div {
    padding: 0;
  }

  &:active {
    outline: 0;
    background-color: ${({ theme }) => theme.colors.focus};
  }

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.disabled};
    background-color: transparent;
  }
`
