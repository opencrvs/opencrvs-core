import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import * as QueryString from 'query-string'
import { IURLParams } from '../utils/authUtils'

export interface IProps {
  language?: string
}

export interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

type IPage = IProps & IDispatchProps

const StyledPage = styled.div.attrs<IPage>({})`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
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
      url('/fonts/notosans-light-webfont-${({ language }) => language}.woff')
      format('woff');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-${({ language }) => language}.woff')
      format('woff');
    font-style: normal;
  }

  @font-face {
    font-family: ${({ theme }) => theme.fonts.boldFont};
    src:
      url('/fonts/notosans-bold-webfont-${({ language }) => language}.woff')
      format('woff');
    font-style: normal;
  }


  @font-face {
    font-family: noto_sansregular;
    src:
      url('/fonts/notosans-regular-webfont-en.woff')
      format('woff');
    font-style: normal;
  }
`

export class Page extends React.Component<RouteComponentProps<{}> & IPage> {
  componentWillMount() {
    const values = QueryString.parse(this.props.location.search)
    this.props.checkAuth(values)
  }
  render() {
    const { children } = this.props
    return (
      <div>
        <StyledPage {...this.props}>{children}</StyledPage>
      </div>
    )
  }
}
