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
import { Navigate, RouteProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { getAuthenticated } from '@client/profile/profileSelectors'
import { hasAccessToRoute } from '@client/utils/authUtils'
import { SystemRoleType } from '@client/utils/gateway'
import { HOME } from '@client/navigation/routes'

interface IProps {
  roles?: SystemRoleType[]
  exact?: boolean
}

/**
 * Higher order component that wraps a route and checks if the user has access to it.
 * If the user does not have access, they are redirected to the home page.
 */
export const ProtectedRouteWrapper = (
  props: IProps & ReturnType<typeof mapStateToProps> & RouteProps
) => {
  const { children, userDetails, roles } = props

  if (roles && userDetails) {
    if (!hasAccessToRoute(roles, userDetails)) {
      return <Navigate to={HOME} />
    }
  }

  return <>{children}</>
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
