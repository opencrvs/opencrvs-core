import * as React from 'react'
import styled from 'styled-components'
import { Warning } from '@opencrvs/components/lib/icons'
import { Paragraph } from '@opencrvs/components/lib/typography'

interface IWarningProps {
  children: string
}

const Container = styled.div`
  flex-direction: row;
  display: flex;
`
const StyledParagraph = styled(Paragraph)`
  margin: 0 10px;
`

export function WarningMessage(props: IWarningProps) {
  return (
    <Container>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
