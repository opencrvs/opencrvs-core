import * as React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.footer`
  height: 80px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

export class Footer extends React.Component {
  render() {
    return <FooterContainer />
  }
}
