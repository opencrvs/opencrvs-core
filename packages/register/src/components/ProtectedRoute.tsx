/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import {
  Route,
  RouteProps,
  RouteComponentProps,
  withRouter
} from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { getAuthenticated } from '@register/profile/profileSelectors'

export interface IProps {
  authenticated: boolean
  userDetailsFetched: boolean
}

class ProtectedRouteWrapper extends Route<
  IProps & RouteProps & RouteComponentProps<{}>
> {
  public render() {
    if (!this.props.authenticated && !this.props.userDetailsFetched) {
      return <div />
    }
    return <Route {...this.props} />
  }
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    authenticated: getAuthenticated(store),
    userDetailsFetched: store.profile.userDetailsFetched
  }
}
export const ProtectedRoute = withRouter(
  connect<IProps, {}, IProps, IStoreState>(mapStateToProps)(
    ProtectedRouteWrapper
  )
) as any
