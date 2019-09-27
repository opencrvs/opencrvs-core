import styled from 'styled-components'

export const Title = styled.div`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.copy};
`
