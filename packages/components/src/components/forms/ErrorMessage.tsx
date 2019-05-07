import styled from 'styled-components'

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.danger};
  padding: 8px;
  text-align: center;
`
