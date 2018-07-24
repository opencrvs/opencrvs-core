import * as React from 'react'
import styled from 'styled-components'
import { PageWrapper } from '@opencrvs/components/lib/layout/PageWrapper'
import { RouteComponentProps } from 'react-router'

export interface IProps {
  language?: string
}

export interface IDispatchProps {
  checkAuth: () => void
}

type IPage = IProps & IDispatchProps

const StyledPage = styled(PageWrapper).attrs<IPage>({})`

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
    this.props.checkAuth()
  }
  render() {
    const { children } = this.props
    return <StyledPage {...this.props}>{children}</StyledPage>
  }
}
