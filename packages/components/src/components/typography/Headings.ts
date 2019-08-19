import styled from 'styled-components'

export const H4 = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
`
