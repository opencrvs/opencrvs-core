import * as React from 'react'
import styled from 'styled-components'

interface IProps {
  left?: React.ReactNode
  right?: React.ReactNode
}

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
  justify-content: space-between;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.headerGradientDark} 0%,
    ${({ theme }) => theme.colors.headerGradientLight} 100%
  );
`

export class Footer extends React.Component<IProps> {
  render() {
    return (
      <FooterContainer>
        {!this.props.left && <p>© OpenCRVS {new Date().getFullYear()}</p>}
        {this.props.left}
        {this.props.right}
      </FooterContainer>
    )
  }
}
