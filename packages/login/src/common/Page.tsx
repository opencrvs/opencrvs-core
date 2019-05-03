import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import { LoginHeader } from './LoginHeader'

export interface IPage {
  submitting: boolean
  language?: string
}

const languageFromProps = ({ language }: IPage) => language

const StyledPage = styled.div.attrs<IPage>({})`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin-top: -280px;
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
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-light-webfont-en.ttf')
      format('truetype');
    font-style: normal;
  }


  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-light-webfont-${languageFromProps}.ttf')
      format('truetype');
    font-style: normal;
  }

`

export class Page extends React.Component<IPage & RouteComponentProps<{}>> {
  render() {
    const { children } = this.props
    return (
      <div>
        <LoginHeader />
        <StyledPage {...this.props}>{children}</StyledPage>
      </div>
    )
  }
}
