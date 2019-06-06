import * as React from 'react'
import styled from '@register/styledComponents'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'

import { getLanguage } from '@opencrvs/register/src/i18n/selectors'
import { IStoreState } from '@opencrvs/register/src/store'
import { setInitialApplications } from '@register/applications'
import { Spinner } from '@opencrvs/components/lib/interface'
import { getInitialApplicationsLoaded } from '@register/applications/selectors'
import {
  getOfflineDataLoaded,
  getOfflineLoadingError
} from '@register/offline/selectors'
import { parse } from 'querystring'
import { IURLParams } from '@register/utils/authUtils'
import { checkAuth } from '@register/profile/profileActions'
import { showConfigurationErrorNotification } from '@register/notification/actions'

const languageFromProps = ({ language }: IPageProps) => language

const StyledPage = styled.div.attrs<IPageProps>({})`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src:
      url('/fonts/notosans-semibold-webfont-en.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
    url('/fonts/notosans-regular-webfont-en.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.semiBoldFont};
    src:
      url('/fonts/notosans-semibold-webfont-${languageFromProps}.ttf')
      format('truetype');
  }

  @font-face {
    /* stylelint-disable-next-line opencrvs/no-font-styles */
    font-family: ${({ theme }) => theme.fonts.regularFont};
    src:
      url('/fonts/notosans-regular-webfont-${languageFromProps}.ttf')
      format('truetype');
  }

`

const StyledSpinner = styled(Spinner)`
  position: absolute;
  top: 50%;
  left: 50%;
`

interface IPageProps {
  language?: string
  initialApplicationsLoaded: boolean
  offlineDataLoaded: boolean
  loadingError: boolean
}

interface IDispatchProps {
  setInitialApplications: () => void
  checkAuth: (urlValues: IURLParams) => void
  showConfigurationErrorNotification: () => void
}

class Component extends React.Component<
  RouteComponentProps<{}> & IPageProps & IDispatchProps
> {
  componentWillReceiveProps(nextProps: RouteComponentProps<{}>) {
    const { hash } = nextProps.location
    const hashChanged = hash && hash !== this.props.location.hash
    if (hashChanged) {
      // Push onto callback queue so it runs after the DOM is updated,
      // this is required when navigating from a different page so that
      // the element is rendered on the page before trying to getElementById.
      setTimeout(() => {
        const id = hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView()
        }
      }, 0)
    }
    if (this.props.loadingError) {
      this.props.showConfigurationErrorNotification()
    }
  }

  componentDidMount() {
    const values = parse(this.props.location.search)
    this.props.checkAuth(values)
    this.props.setInitialApplications()
  }

  render() {
    const {
      initialApplicationsLoaded,
      offlineDataLoaded,
      children
    } = this.props

    if (initialApplicationsLoaded && offlineDataLoaded) {
      return (
        <div>
          <StyledPage {...this.props}>{children}</StyledPage>
        </div>
      )
    } else {
      return <StyledSpinner id="appSpinner" />
    }
  }
}

const mapStateToProps = (store: IStoreState): IPageProps => {
  return {
    language: getLanguage(store),
    initialApplicationsLoaded: getInitialApplicationsLoaded(store),
    offlineDataLoaded: getOfflineDataLoaded(store),
    loadingError: getOfflineLoadingError(store)
  }
}

const mapDispatchToProps = {
  setInitialApplications,
  checkAuth,
  showConfigurationErrorNotification
}

export const Page = withRouter(
  connect<IPageProps, IDispatchProps, IPageProps, IStoreState>(
    mapStateToProps,
    mapDispatchToProps
  )(Component)
) as any
