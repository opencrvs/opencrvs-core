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

import {
  useLocation,
  useNavigate,
  useParams,
  Location,
  NavigateFunction,
  Params
} from 'react-router-dom'
import * as React from 'react'

export type RouteComponentProps<T = {}> = {
  router: {
    location: Location
    navigate: NavigateFunction
    params: Readonly<Params<string>>
    match: { params: Readonly<Params<string>> }
  }
} & T

/**
 * Higher order component to pass router props to a component.
 * withRouter was deprecated in react-router-dom v6.
 * This implementation introduces the similar functionality using react-router-dom hooks.
 */
export function withRouter<ComponentProps extends RouteComponentProps>(
  Component: React.ComponentType<ComponentProps>
) {
  function ComponentWithRouterProp(props: Omit<ComponentProps, 'router'>) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    /**
     * For backwards compatibility, match is added to the router prop.
     */
    const match = { params }
    return (
      <Component
        {...(props as ComponentProps)}
        router={{ location, navigate, params, match }}
      />
    )
  }

  return ComponentWithRouterProp
}
