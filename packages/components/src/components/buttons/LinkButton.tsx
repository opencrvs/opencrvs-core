import styled from 'styled-components'

export const LinkButton = styled.a`
  width: auto;
  margin: 0 8px;
  text-decoration: underline;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  align-items: center;
  display: inline-flex;
  border: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
  }
  &:hover {
    opacity: 0.8;
  }

  &:active {
    background: ${({ theme }) => theme.colors.creamCan};
  }
`
