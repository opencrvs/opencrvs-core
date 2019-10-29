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
import { IStoreState } from '@performance/store'
import { getAuthenticated } from '@performance/profile/selectors'
import { checkAuth } from '@performance/profile/actions'
import { IURLParams } from '@performance/utils/authUtils'
import { parse } from 'querystring'

export interface IProps {
  authenticated: boolean
}
interface IDispatchProps {
  checkAuth: (urlValues: IURLParams) => void
}

type Props = RouteProps & RouteComponentProps<{}>

type FullProps = IProps & IDispatchProps & Props

class ProtectedRouteWrapper extends Route<IProps & IDispatchProps & Props> {
  public componentDidMount() {
    const values = parse(this.props.location.search)
    this.props.checkAuth(values)
  }
  public render() {
    if (!this.props.authenticated) {
      return <div />
    }
    return <Route {...this.props} />
  }
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    authenticated: getAuthenticated(store)
  }
}
export const ProtectedRoute = withRouter<Props>(
  connect<IProps, IDispatchProps, any, IStoreState>(
    mapStateToProps,
    {
      checkAuth
    }
  )(ProtectedRouteWrapper)
) as any
