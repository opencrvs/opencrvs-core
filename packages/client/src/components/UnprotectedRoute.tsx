import React from 'react'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'
import { useDispatch, useSelector } from 'react-redux'
import { configAnonymousUserLoaded } from '@client/offline/actions'
import { referenceApi } from '@client/utils/referenceApi'
import { IStoreState } from '@client/store'
import { Route, RouteProps } from 'react-router'

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
