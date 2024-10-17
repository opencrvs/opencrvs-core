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
import React from 'react'
import { Redirect, Route, RouteProps } from 'react-router'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { getAuthenticated } from '@client/profile/profileSelectors'
import { HOME } from '@client/navigation/routes'
import { usePermissions } from '@client/hooks/useAuthorization'
import { Scope } from '@client/utils/gateway'

interface IProps extends RouteProps {
  scopes?: Scope[]
}

export const ProtectedRoute: React.FC<IProps> = ({ scopes, ...rest }) => {
  const authenticated = useSelector(getAuthenticated)
  const userDetailsFetched = useSelector(
    (state: IStoreState) => state.profile.userDetailsFetched
  )
  const { hasAnyScope } = usePermissions()

  if (!authenticated && !userDetailsFetched) {
    return <div />
  }

  if (scopes && !hasAnyScope(scopes)) {
    return <Redirect to={HOME} />
  }

  return <Route {...rest} />
}
