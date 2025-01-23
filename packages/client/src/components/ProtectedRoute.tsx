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
import { Navigate, RouteProps } from 'react-router-dom'
import { HOME } from '@client/navigation/routes'
import { usePermissions } from '@client/hooks/useAuthorization'
import { Scope } from '@opencrvs/commons/client'

interface IProps {
  scopes?: Scope[]
}

/**
 * Higher order component that wraps a route and checks if the user has access to it.
 * If the user does not have access, they are redirected to the home page.
 */
export const ProtectedRoute: React.FC<IProps & RouteProps> = ({
  scopes = [],
  children,
  ...rest
}) => {
  const { hasAnyScope } = usePermissions()

  if (!hasAnyScope(scopes)) {
    return <Navigate to={HOME} />
  }

  return <>{children}</>
}
