import styled from 'styled-components'

export const LinkButton = styled.a`
  width: auto;
  margin: 0 8px;
  text-decoration: underline;
  ${({ theme }) => theme.fonts.bodyStyle};
  align-items: center;
  display: inline-flex;
  border: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
  }
  &:hover {
    opacity: 0.8;
  }

  &:active {
    background: ${({ theme }) => theme.colors.focus};
  }
`
