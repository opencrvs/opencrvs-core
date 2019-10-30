import * as React from 'react'
import styled, { StyledComponentBase } from 'styled-components'

// stylelint-disable opencrvs/no-font-styles
export const EnglishText = styled.span`
  font-family: ${({ theme }) => theme.fonts.englishTextFont};
`
