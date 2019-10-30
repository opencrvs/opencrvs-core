import styled from 'styled-components'

export const Paragraph = styled.p<{ fontSize?: string }>`
  ${({ theme }) => theme.fonts.bodyStyle};
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  font-size: ${({ fontSize, theme }) =>
    fontSize ? theme.fonts[fontSize] : theme.fonts.bodyStyle};
  width: 100%;
`
