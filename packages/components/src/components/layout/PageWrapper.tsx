import * as React from 'react'
import styled from 'styled-components'
import { Content } from './Content'

const Page = styled.div`
  display: flex;
  min-width: ${({ theme }) => theme.grid.minWidth}px;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  ${({ theme }) => theme.fonts.bodyStyle};
`

const Wrapper = styled.div`
  margin: auto;
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
`

export class PageWrapper extends React.Component {
  render() {
    const { children } = this.props
    return (
      <Page>
        <Wrapper>
          <Content>{children}</Content>
        </Wrapper>
      </Page>
    )
  }
}
