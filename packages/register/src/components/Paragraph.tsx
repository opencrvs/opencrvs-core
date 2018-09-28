import * as React from 'react'
import styled from 'styled-components'

const StyledParagraph = styled.p`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  width: 100%;
  font-weight: bold;
`
export class Paragraph extends React.Component {
  render() {
    return <StyledParagraph {...this.props} />
  }
}
