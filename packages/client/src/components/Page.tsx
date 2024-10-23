/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import styled from 'styled-components'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@opencrvs/client/src/store'
import {
  getOfflineData,
  getOfflineDataLoaded,
  getOfflineLoadingError
} from '@client/offline/selectors'
import { checkAuth } from '@client/profile/profileActions'
import {
  showConfigurationErrorNotification,
  hideConfigurationErrorNotification
} from '@client/notification/actions'
import { changeLanguage } from '@client/i18n/actions'
import { Ii18n } from '@client/type/i18n'
import { getPreferredLanguage } from '@client/i18n/utils'
import { IOfflineData } from '@client/offline/reducer'
import { isNavigatorOnline } from '@client/utils'
import { LoadingBar } from '@opencrvs/components/src/LoadingBar/LoadingBar'

const StyledPage = styled.div<IPageProps>`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  box-sizing: border-box;
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
`
interface IPageProps {
  offlineDataLoaded: boolean
  loadingError: boolean
  offlineData: IOfflineData | undefined
  children?: React.ReactNode
}

interface IDispatchProps {
  checkAuth: typeof checkAuth
  showConfigurationErrorNotification: () => void
  hideConfigurationErrorNotification: () => void
  changeLanguage: (values: Ii18n) => void
}

class Component extends React.Component<
  RouteComponentProps<{}> & IPageProps & IDispatchProps
> {
  componentDidUpdate(
    prevProps: RouteComponentProps<{}> & IPageProps & IDispatchProps
  ) {
    const { hash } = this.props.location
    const hashChanged = hash && hash !== prevProps.location.hash
    const appName = this.props.offlineData
      ? this.props.offlineData.config.APPLICATION_NAME
      : ''
    if (appName) document.title = appName
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
    if (this.props.loadingError && isNavigatorOnline()) {
      this.props.showConfigurationErrorNotification()
    }
    if (prevProps.loadingError && !this.props.loadingError) {
      this.props.hideConfigurationErrorNotification()
    }
  }

  async componentDidMount() {
    const language = await getPreferredLanguage()

    this.props.changeLanguage({ language })

    this.props.checkAuth()
  }

  render() {
    const { offlineDataLoaded, children } = this.props

    if (offlineDataLoaded) {
      return (
        <div id="readyDeclaration">
          <StyledPage {...this.props}>{children}</StyledPage>
        </div>
      )
    } else {
      return (
        <>
          <LoadingBar />
        </>
      )
    }
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    offlineDataLoaded: getOfflineDataLoaded(store),
    loadingError: getOfflineLoadingError(store),
    offlineData: getOfflineDataLoaded(store) ? getOfflineData(store) : undefined
  }
}

const mapDispatchToProps = {
  checkAuth,
  showConfigurationErrorNotification,
  hideConfigurationErrorNotification,
  changeLanguage
}

export const Page = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Component)
)
