import styled from 'styled-components'

export const Main = styled.section`
  flex: 1;
  width: 100%;
  margin-bottom: 30px;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.defaultFontStyle} letter-spacing: 0.5px;
`
