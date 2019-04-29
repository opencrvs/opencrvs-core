import * as React from 'react'
import styled from 'styled-components'
import { Content } from './Content'

const Page = styled.div`
  display: flex;
  min-width: ${({ theme }: any) => theme.grid.minWidth}px;
  flex-direction: column;
  background-color: ${({ theme }: any) => theme.colors.background};
  min-height: 100vh;
  ${({ theme }: any) => theme.fonts.defaultFontStyle};
`

const Wrapper = styled.div`
  margin: auto;
  max-width: ${({ theme }: any) => theme.grid.breakpoints.lg}px;
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
