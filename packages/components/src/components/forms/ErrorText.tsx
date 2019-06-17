import * as React from 'react'
import { Warning } from '../icons'
import { Paragraph } from '../typography'
import styled from 'styled-components'

interface IErrorTextProps {
  children: string
  ignoreMediaQuery?: boolean
}

const Container = styled.div<{ ignoreMediaQuery?: boolean }>`
  flex-direction: row;
  display: flex;
  align-items: center;

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
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  color: ${({ theme }) => theme.colors.error};
`

export function ErrorText(props: IErrorTextProps) {
  return (
    <Container ignoreMediaQuery={props.ignoreMediaQuery}>
      <Warning />
      <StyledParagraph>{props.children}</StyledParagraph>
    </Container>
  )
}
