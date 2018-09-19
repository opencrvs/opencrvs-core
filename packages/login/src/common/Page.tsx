import * as React from 'react'
import styled from 'styled-components'
import { PageWrapper } from '@opencrvs/components/lib/layout'
import { RouteComponentProps } from 'react-router'

export interface IPage {
  language?: string
}

const languageFromProps = ({ language }: IPage) => language

const StyledPage = styled(PageWrapper).attrs<IPage>({})`

  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.lightFont};
    src:
      url('/fonts/notosans-extra-light-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-light-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    src:
      url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }
`

export class Page extends React.Component<IPage & RouteComponentProps<{}>> {
  render() {
    const { language, children } = this.props
    return <StyledPage language={language}>{children}</StyledPage>
  }
}
