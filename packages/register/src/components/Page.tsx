import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import * as QueryString from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { IURLParams } from '@opencrvs/register/src/utils/authUtils'
import { getLanguage } from '@opencrvs/register/src/i18n/intlSelectors'
import { IStoreState } from '@opencrvs/register/src/store'
import * as actions from '@opencrvs/register/src/profile/profileActions'

interface IPageProps {
  language?: string
}

export interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

type IPage = IPageProps & IDispatchProps

const StyledPage = styled.div.attrs<IPage>({})`
  background: #f4f4f4;
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

class Component extends React.Component<RouteComponentProps<{}> & IPage> {
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

const mapStateToProps = (store: IStoreState): IPageProps => {
  return {
    language: getLanguage(store)
  }
}

const mapDispatchToProps = {
  checkAuth: actions.checkAuth
}

export const Page = connect<IPageProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Component))
