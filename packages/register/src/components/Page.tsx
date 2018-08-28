import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router'
import * as QueryString from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { IURLParams } from '@opencrvs/register/src/utils/authUtils'
import { getLanguage } from '@opencrvs/register/src/i18n/i18nSelectors'
import { IStoreState } from '@opencrvs/register/src/store'
import * as actions from '@opencrvs/register/src/profile/profileActions'

interface IPageProps {
  language?: string
}

export interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

type IPage = IPageProps & IDispatchProps

const languageFromProps = ({ language }: IPageProps) => language

const StyledPage = styled.div.attrs<IPage>({})`
  background: #f4f4f4;
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

export const Page = withRouter(
  connect<IPageProps, IDispatchProps>(mapStateToProps, mapDispatchToProps)(
    Component
  )
)
