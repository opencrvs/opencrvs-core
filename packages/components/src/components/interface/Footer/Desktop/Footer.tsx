import * as React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.section`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
  padding: 8px 16px;
  display: flex;
  flex-grow: 1;
  max-height: 54px;
  & > p {
    font-size: 16px;
    color: ${({ theme }) => theme.colors.white};
    font-family: ${({ theme }) => theme.fonts.regularFont};
  }
  flex-direction: row;
  & a {
    color: ${({ theme }) => theme.colors.white};
  }
  align-items: center;
  width: 100%;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientDark} 0%,
    ${({ theme }) => theme.colors.headerGradientLight} 100%
  );
`

export class Footer extends React.Component {
  render() {
    return <FooterContainer>{this.props.children}</FooterContainer>
  }
}
