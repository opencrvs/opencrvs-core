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
import { configAnonymousUserLoaded } from '@client/offline/actions'
import { IStoreState } from '@client/store'
import { referenceApi } from '@client/utils/referenceApi'
import { Spinner } from '@opencrvs/components'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, RouteProps } from 'react-router'
import styled from 'styled-components'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  margin-left: -24px;
  margin-top: -24px;
  top: calc(50% - 20px);
  left: 50%;
  width: 40px;
  height: 40px;
`

const UnprotectedRouteWrapper = (props: RouteProps) => {
  const dispatch = useDispatch()
  const offlineData = useSelector((store: IStoreState) => {
    return store?.offline?.offlineData.anonymousConfig
  })

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { config } = await referenceApi.loadConfigAnonymousUser()
        if (config) {
          document.title = config?.APPLICATION_NAME as string
          dispatch(configAnonymousUserLoaded({ anonymousConfig: config }))
        }
      } catch (e) {}
    }
    fetchData()
  }, [dispatch])

  if (!offlineData) {
    return (
      <>
        <StyledSpinner id="appSpinner" />
      </>
    )
  }
  return <Route {...props} />
}

export const UnprotectedRoute = UnprotectedRouteWrapper
