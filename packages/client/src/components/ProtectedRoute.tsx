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
import { Route } from 'react-router'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getAuthenticated } from '@client/profile/profileSelectors'
import { hasAccessToRoute } from '@client/utils/authUtils'
import { SystemRoleType } from '@client/utils/gateway'

interface IProps {
  roles?: SystemRoleType[]
}

class ProtectedRouteWrapper extends Route<
  IProps & ReturnType<typeof mapStateToProps>
> {
  public render() {
    const { authenticated, userDetailsFetched, userDetails, roles, ...rest } =
      this.props
    if (!authenticated && !userDetailsFetched) {
      return <div />
    }
    if (roles && userDetails) {
      if (!hasAccessToRoute(roles, userDetails)) {
        throw new Error('Unauthorised!')
      }
    }
    return <Route {...rest} />
  }
}

const mapStateToProps = (store: IStoreState, props: IProps) => {
  return {
    ...props,
    authenticated: getAuthenticated(store),
    userDetails: store.profile.userDetails,
    userDetailsFetched: store.profile.userDetailsFetched
  }
}
export const ProtectedRoute = connect(mapStateToProps)(ProtectedRouteWrapper)
