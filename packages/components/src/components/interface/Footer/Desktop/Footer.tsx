import * as React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.footer`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
  padding: 8px 16px;
  display: flex;
  flex-grow: 1;
  max-height: 40px;
  & > p {
    color: ${({ theme }) => theme.colors.white};
    ${({ theme }) => theme.fonts.captionStyle};
  }
  flex-direction: row;
  & a {
    color: ${({ theme }) => theme.colors.white};
  }
  align-items: center;
  width: 100%;
  ${({ theme }) => theme.gradients.gradientNightshade};
`

export class Footer extends React.Component {
  render() {
    return <FooterContainer>{this.props.children}</FooterContainer>
  }
}
