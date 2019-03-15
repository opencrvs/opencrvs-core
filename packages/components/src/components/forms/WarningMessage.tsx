import * as React from 'react'
import styled from 'styled-components'
import { Warning } from '../icons'
import { Paragraph } from '../typography'

interface IWarningProps {
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`
const StyledParagraph = styled(Paragraph)`
  margin: 3px 10px;
  line-height: 1.6em;
`

export function WarningMessage(props: IWarningProps) {
  return (
    <Container ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
