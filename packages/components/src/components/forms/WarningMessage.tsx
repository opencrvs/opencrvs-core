import * as React from 'react'
import styled from 'styled-components'
import { Warning } from '../icons'
import { Paragraph } from '../typography'

interface IWarningProps {
  children: string
}

const Container = styled.div`
  flex-direction: row;
  display: flex;

  @media (min-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 515px;
  }
`
const StyledParagraph = styled(Paragraph)`
  margin: 3px 10px;
  line-height: 1.6em;
`

export function WarningMessage(props: IWarningProps) {
  return (
    <Container>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
