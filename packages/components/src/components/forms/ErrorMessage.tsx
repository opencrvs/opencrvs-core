import styled from 'styled-components'

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.error};
  padding: 8px 24px;
  text-align: center;
  width: 100%;
`
