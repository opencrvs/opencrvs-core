import * as React from 'react'
import styled from 'styled-components'
import { Warning } from '../icons'

interface IWarningProps {
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;
  margin: 24px 0;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`
const StyledParagraph = styled.div`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
`

export function WarningMessage(props: IWarningProps) {
  return (
    <Container ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
